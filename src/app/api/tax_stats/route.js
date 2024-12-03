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
            CASE 
                WHEN t.IncomeBracket = 1 THEN 12500  -- Midpoint of $1-$25,000
                WHEN t.IncomeBracket = 2 THEN 37500  -- Midpoint of $25,001-$50,000
                WHEN t.IncomeBracket = 3 THEN 62500  -- Midpoint of $50,001-$75,000
                WHEN t.IncomeBracket = 4 THEN 87500  -- Midpoint of $75,001-$100,000
                WHEN t.IncomeBracket = 5 THEN 150000 -- Midpoint of $100,001-$200,000
                WHEN t.IncomeBracket = 6 THEN 250000 -- Conservative estimate for $200,001+
                ELSE 0 
            END AS "Average Nominal Income",
            (CASE 
                WHEN t.IncomeBracket = 1 THEN 12500
                WHEN t.IncomeBracket = 2 THEN 37500
                WHEN t.IncomeBracket = 3 THEN 62500
                WHEN t.IncomeBracket = 4 THEN 87500
                WHEN t.IncomeBracket = 5 THEN 150000
                WHEN t.IncomeBracket = 6 THEN 250000
                ELSE 0 
            END) / (c.AvgCPI / 100) AS "Average Real Income"
        FROM TypicalIncomeBracket t
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
        WITH ModeAGIStub AS (
        SELECT 
            EXTRACT(YEAR FROM s.DateOf) AS Year, -- Extract year
            s.State AS State,
            s.AGI_stub AS IncomeBracket,
            COUNT(*) AS StubCount -- Count occurrences of each AGI_stub
        FROM 
            "SAM.GROSSER".SOI_TAXSTATS s
        GROUP BY 
            EXTRACT(YEAR FROM s.DateOf), s.State, s.AGI_stub
        ),
        TypicalIncomeBracket AS (
            SELECT 
                Year,
                State,
                IncomeBracket AS ModeIncomeBracket -- The most common AGI_stub for each state and year
            FROM (
                SELECT 
                    EXTRACT(YEAR FROM s.DateOf) AS Year,
                    s.State AS State,
                    s.AGI_stub AS IncomeBracket,
                    COUNT(*) AS StubCount,
                    ROW_NUMBER() OVER (PARTITION BY EXTRACT(YEAR FROM s.DateOf), s.State ORDER BY COUNT(*) DESC) AS Rank
                FROM 
                    "SAM.GROSSER".SOI_TAXSTATS s
                GROUP BY 
                    EXTRACT(YEAR FROM s.DateOf), s.State, s.AGI_stub
            ) RankedStubs
            WHERE 
                Rank = 1 -- Select the most frequent (mode) income bracket
        )
        SELECT 
            EXTRACT(YEAR FROM s.DateOf) AS "Year", -- Repeat calculation for Year
            s.State AS "State",
            t.ModeIncomeBracket AS "Average Income Bracket", -- Include the mode income bracket
            f.FedFunds AS "Federal Funds Rate", -- Use the Fed Funds rate for each year
            CASE
                WHEN SUM(s.NumOfEnergyTaxCredits) > 0 THEN ROUND(SUM(s.EnergyTaxCreditAmount) * 1.0 / SUM(s.NumOfEnergyTaxCredits), 3)
                ELSE 0
            END AS "Average Energy Credits", -- Average energy credits per year
            CASE
                WHEN SUM(s.NumOfCareCredits) > 0 THEN ROUND(SUM(s.CareCreditsAmount) * 1.0 / SUM(s.NumOfCareCredits), 3)
                ELSE 0
            END AS "Average Care Credits Per Dependent", -- Average care credits per dependent per year
            t.ModeIncomeBracket * 1000 AS "Average Nominal Income" 
        FROM 
            "SAM.GROSSER".SOI_TAXSTATS s
        JOIN 
            TypicalIncomeBracket t 
            ON s.State = t.State 
              AND EXTRACT(YEAR FROM s.DateOf) = t.Year 
        JOIN 
            "SAM.GROSSER".FederalFunds f 
            ON EXTRACT(YEAR FROM s.DateOf) = EXTRACT(YEAR FROM f.DateOf) 
        WHERE 
            s.DateOf BETWEEN TO_DATE('01/01/' || :startYear, 'MM/DD/YYYY') 
                        AND TO_DATE('01/01/' || :endYear, 'MM/DD/YYYY') 
            ${statesArray.length > 0 ? `AND s.State IN (${placeholders})` : ""}
        GROUP BY 
            EXTRACT(YEAR FROM s.DateOf), s.State, t.ModeIncomeBracket, f.FedFunds -- Repeat full Year calculation
        ORDER BY 
            EXTRACT(YEAR FROM s.DateOf), s.State
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
            SUM(CareCreditsAmount) AS "Total Care Credits",
            CASE
                WHEN SUM(NumOfCareCredits) > 0 THEN ROUND(SUM(CareCreditsAmount) * 1.0 / SUM(NumOfCareCredits), 3)
                ELSE 0
            END AS "Average Care Credits Per Dependent",
            CASE
                WHEN SUM(NumOfEnergyTaxCredits) > 0 THEN ROUND(SUM(EnergyTaxCreditAmount) * 1.0 / SUM(NumOfEnergyTaxCredits), 3)
                ELSE 0
            END AS "Average Energy Credit Amount"
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
    else if (queryID === 6) { // Fed Funds Rate query
      query = `
        SELECT 
          EXTRACT(YEAR FROM DateOf) AS "Year",
          FedFunds AS "FedFundsRate"
        FROM 
          "SAM.GROSSER".FederalFunds
        WHERE 
          EXTRACT(YEAR FROM DateOf) BETWEEN :startYear AND :endYear
        ORDER BY 
          EXTRACT(YEAR FROM DateOf)
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