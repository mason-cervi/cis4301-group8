import { NextResponse } from 'next/server';
import { initialize, execute } from '../../../db';

export async function GET(request) {
  const url = new URL(request.url);
  const queryID = Number(url.searchParams.get('queryId'));
  const startYear = url.searchParams.get('startYear');
  const endYear = url.searchParams.get('endYear');
  const state = url.searchParams.get('state');
  const statesArray = state ? state.split(",") : [];
  const placeholders = statesArray.map((_, index) => `:state${index}`).join(",");

  try {
    let query;
    const pool = await initialize();
    const connection = await pool.getConnection();

    if (queryID == 1) { // Query 2: Geo location of claimant affect dependent care claim amount over time 
        query = `
        SELECT
        State AS "State",
        EXTRACT(YEAR FROM DateOf) AS "Year",
        SUM(CareCreditsAmount) AS "Total Amount of Care Credits",
        SUM(NumOfCareCredits) AS "Total Number of Care Credits",
        CASE
        WHEN SUM(NumOfCareCredits) > 0 THEN (ROUND(SUM(CareCreditsAmount) * 1.0 / SUM(NumOfCareCredits), 3))
        ELSE 0
        END AS "Average Care Credits Per Dependent"
      FROM
        "SAM.GROSSER".SOI_TAXSTATS
        WHERE dateof BETWEEN TO_DATE('01/01/' || :startYear, 'MM/DD/YYYY') AND TO_DATE('01/01/' || :endYear, 'MM/DD/YYYY') 
        ${statesArray.length > 0 ? `AND State IN (${placeholders})` : ""}
      GROUP BY
        State, DateOf
      ORDER BY
        State, DateOf
        `;
    }
    else if (queryID == 2) { // Query 1: geo location of the claimant affect uptake rate and claim amount of residential energy over time
        query = `
        SELECT 
        EXTRACT(YEAR FROM DateOf) AS "Year", -- Extract year using EXTRACT
        State AS "State",
        SUM(EnergyTaxCreditAmount) AS TotalEnergyCreditsAmount, 
        SUM(NumOfEnergyTaxCredits) AS TotalNumOfEnergyCredits,
        CASE
            WHEN COUNT(*) > 0 THEN ROUND(SUM(NumOfEnergyTaxCredits) * 1.0 / COUNT(*), 3)
            ELSE 0
        END AS "Uptake Rate", -- Percentage of returns with energy tax credits
        CASE
            WHEN SUM(NumOfEnergyTaxCredits) > 0 THEN ROUND(SUM(EnergyTaxCreditAmount) * 1.0 / SUM(NumOfEnergyTaxCredits), 3)
            ELSE 0
        END AS "Average Energy Credit Amount" -- Average credit amount per claim
      FROM 
        "SAM.GROSSER".SOI_TAXSTATS
        WHERE dateof BETWEEN TO_DATE('01/01/' || :startYear, 'MM/DD/YYYY') AND TO_DATE('01/01/' || :endYear, 'MM/DD/YYYY') 
        ${statesArray.length > 0 ? `AND State IN (${placeholders})` : ""}
      GROUP BY 
        State, DateOf
      ORDER BY 
        State, DateOf
        `;
    }
    else if (queryID == 3) { // Query 3: how does inflation impact purchasing power and take home pay over time?
        query = `
        WITH AvgCPI AS (
            SELECT 
                EXTRACT(YEAR FROM c.DateOf) AS Year,
                AVG(c.CPIAUCSL) AS AvgCPI -- Calculate average CPI for each year
            FROM 
                "SAM.GROSSER".ConsumerPriceIndex c
            GROUP BY 
                EXTRACT(YEAR FROM c.DateOf)
        ),
        ModeAGIStub AS (
            SELECT 
                EXTRACT(YEAR FROM t.DateOf) AS Year,
                t.State,
                t.AGI_stub AS IncomeBracket,
                COUNT(*) AS StubCount -- Count occurrences of each AGI_Stub
            FROM 
                "SAM.GROSSER".SOI_TaxStats t
            GROUP BY 
                EXTRACT(YEAR FROM t.DateOf), t.State, t.AGI_stub
        ),
        TypicalIncomeBracket AS (
            SELECT 
                Year,
                State,
                IncomeBracket -- The most common AGI_Stub for each year and state
            FROM (
                SELECT 
                    Year,
                    State,
                    IncomeBracket,
                    StubCount,
                    ROW_NUMBER() OVER (PARTITION BY Year, State ORDER BY StubCount DESC) AS Rank
                FROM 
                    ModeAGIStub
            ) RankedStubs
            WHERE 
                Rank = 1 -- Select the most common AGI_Stub
        )
        SELECT 
            t.Year AS "Year",
            t.State AS "State",
            t.IncomeBracket AS TypicalIncomeBracket,
            c.AvgCPI,
            t.IncomeBracket * 1000 AS "Average Nominal Income", -- Convert AGI stub to nominal income (adjust factor as needed)
            (t.IncomeBracket * 1000) / (c.AvgCPI / 100) AS "Average Real Income" -- Adjust nominal income for inflation
        FROM 
            TypicalIncomeBracket t
        JOIN 
            AvgCPI c 
            ON t.Year = c.Year
        WHERE t.Year BETWEEN :startYear AND :endYear
          ${statesArray.length > 0 ? `AND t.State IN (${placeholders})` : ""}
        ORDER BY 
            t.Year, t.State
        `;
    }
    else if (queryID == 4) {  // Query 4: Fed funds rate impact sector wise income trends over time?
        query = `
        SELECT
        EXTRACT(YEAR FROM s.DateOf) AS "Year",
        s.State as "State",
        s.AGI_stub AS "Income Bracket",
        AVG(f.FedFunds) AS "Average Fed Funds Rate",
        COUNT(*) AS "Total Returns",
        SUM(s.EnergyTaxCreditAmount) AS "Total Energy Credits",
        SUM(s.CareCreditsAmount) AS "Total Care Credits",
          CASE
            WHEN COUNT(*) > 0 THEN SUM(s.EnergyTaxCreditAmount) * 1.0 / COUNT(*)
            ELSE 0
          END AS "Average Energy Credits Per Return"
        FROM 
          "SAM.GROSSER".FederalFunds f, "SAM.GROSSER".SOI_TAXSTATS s
        WHERE s.DateOf BETWEEN TO_DATE('01/01/' || :startYear, 'MM/DD/YYYY') AND TO_DATE('01/01/' || :endYear, 'MM/DD/YYYY') 
          ${statesArray.length > 0 ? `AND s.State IN (${placeholders})` : ""}
        GROUP BY
          EXTRACT(YEAR FROM s.DateOf), s.State, s.AGI_stub
        ORDER BY
          "Year", s.State, "Income Bracket"
         `;
    }
    else if (queryID == 5) {  // Query 5: How does income distribution across income brackets change over time in different states?
        query = `
        SELECT
        State as "State",
        EXTRACT(YEAR FROM DateOf) AS "Year",
        AGI_stub AS "Income Bracket",
        COUNT(*) AS "Total Returns",
        SUM(EnergyTaxCreditAmount) AS "Total Energy Credits",
        SUM(CareCreditsAmount) AS "Total Care Credits"
        FROM
          "SAM.GROSSER".SOI_TAXSTATS
        WHERE dateof BETWEEN TO_DATE('01/01/' || :startYear, 'MM/DD/YYYY') AND TO_DATE('01/01/' || :endYear, 'MM/DD/YYYY') 
          ${statesArray.length > 0 ? `AND State IN (${placeholders})` : ""}
        GROUP BY
          State, EXTRACT(YEAR FROM DateOf), AGI_stub
        ORDER BY
          State, "Year", "Income Bracket"
        `;
    }

    const bindParams = {
      startYear: Number(startYear),
      endYear: Number(endYear),
      ...Object.fromEntries(statesArray.map((state, index) => [`state${index}`, state]))
    };
    
    const result = await execute(connection, query, bindParams);

    await connection.close();

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error executing query:', error);
    return NextResponse.json({ error: 'Database query failed' }, { status: 500 });
  }
}