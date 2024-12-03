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
        SUM(NumOfCareCredits * CareCreditsAmount) AS "Total Amount of Care Credits", -- Total amount considering per-zipcode data
        SUM(NumOfCareCredits) AS "Total Number of Care Credits", -- Total number of care credits
        CASE
            WHEN SUM(NumOfCareCredits) > 0 THEN 
                ROUND(SUM(NumOfCareCredits * CareCreditsAmount) * 1.0 / SUM(NumOfCareCredits), 3) -- Average per dependent
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
        State AS "State",
        EXTRACT(YEAR FROM DateOf) AS "Year",
        SUM(NumOfEnergyTaxCredits * EnergyTaxCreditAmount) AS "Total Energy Credits Amount", -- Total energy credits for the state and year
        SUM(NumOfEnergyTaxCredits) AS "Total Number of Energy Credits", -- Total number of energy credits
        CASE
            WHEN SUM(NumReturns) > 0 THEN ROUND(SUM(NumOfEnergyTaxCredits) * 1.0 / SUM(NumReturns), 3) -- Uptake rate calculation
            ELSE 0
        END AS "Uptake Rate", -- Percentage of returns with energy tax credits
        CASE
            WHEN SUM(NumOfEnergyTaxCredits) > 0 THEN ROUND(SUM(NumOfEnergyTaxCredits * EnergyTaxCreditAmount) * 1.0 / SUM(NumOfEnergyTaxCredits), 3)
            ELSE 0
        END AS "Average Energy Credit Amount" -- Average credit amount per claim
        FROM 
            "SAM.GROSSER".SOI_TAXSTATS
        WHERE 
            dateof BETWEEN TO_DATE('01/01/' || :startYear, 'MM/DD/YYYY') 
                      AND TO_DATE('01/01/' || :endYear, 'MM/DD/YYYY')
            ${statesArray.length > 0 ? `AND State IN (${placeholders})` : ""}
        GROUP BY 
            State, EXTRACT(YEAR FROM DateOf) -- Group by state and year
        ORDER BY 
            State, EXTRACT(YEAR FROM DateOf);
          `;
    }
    else if (queryID == 3) { // Query 3: how does inflation impact purchasing power and take home pay over time?
        query = `
        WITH WeightedIncome AS (
        SELECT 
            EXTRACT(YEAR FROM t.DateOf) AS Year,
            t.State AS State,
            t.AGI_stub AS IncomeBracket,
            SUM(t.AGI_stub * t.NumReturns) AS TotalNominalIncome, -- Total nominal income (weighted by NumReturns)
            SUM(t.NumReturns) AS TotalReturns -- Total number of returns per year/state/income bracket
        FROM 
            "SAM.GROSSER".SOI_TaxStats t
        GROUP BY 
            EXTRACT(YEAR FROM t.DateOf), t.State, t.AGI_stub
        ),
        InflationAdjusted AS (
            SELECT 
                w.Year,
                w.State,
                w.IncomeBracket,
                w.TotalNominalIncome / w.TotalReturns AS AvgNominalIncome, -- Average nominal income (weighted)
                c.CPIAUCSL AS CPI, -- Consumer Price Index for the year
                (w.TotalNominalIncome / w.TotalReturns) / (c.CPIAUCSL / 100) AS RealIncome -- Inflation-adjusted real income
            FROM 
                WeightedIncome w
            JOIN 
                "SAM.GROSSER".ConsumerPriceIndex c 
                ON w.Year = EXTRACT(YEAR FROM c.DateOf) -- Join CPI data by year
        )
        SELECT 
            Year AS "Year",
            State AS "State",
            IncomeBracket,
            ROUND(AvgNominalIncome, 2) AS "AvgNominalIncome", -- Round for readability
            ROUND(RealIncome, 2) AS "RealIncome",
            ROUND(CPI, 2) AS "AvgCPI" -- CPI for the year
        FROM 
            InflationAdjusted
        ORDER BY 
            Year, State, IncomeBracket
      `;
    }
    else if (queryID == 4) {  // Query 4: Fed funds rate impact sector wise income trends over time?
        query = `
        WITH IncomeDistribution AS (
        SELECT
            State,
            EXTRACT(YEAR FROM DateOf) AS Year,
            CASE 
                WHEN AGI_stub IN (1, 2) THEN 'Low Income'
                WHEN AGI_stub IN (3, 4) THEN 'Middle Income'
                WHEN AGI_stub IN (5, 6) THEN 'High Income'
            END AS IncomeBracket,
            SUM(NumReturns) AS NumPeople
        FROM
            "SAM.GROSSER".SOI_TAXSTATS
        WHERE 
            dateof BETWEEN TO_DATE('01/01/' || :startYear, 'MM/DD/YYYY') 
                      AND TO_DATE('01/01/' || :endYear, 'MM/DD/YYYY')
            ${statesArray.length > 0 ? `AND State IN (${placeholders})` : ""}
        GROUP BY
            State, EXTRACT(YEAR FROM DateOf), 
            CASE 
                WHEN AGI_stub IN (1, 2) THEN 'Low Income'
                WHEN AGI_stub IN (3, 4) THEN 'Middle Income'
                WHEN AGI_stub IN (5, 6) THEN 'High Income'
            END
        )
        SELECT 
            State,
            Year,
            IncomeBracket,
            NumPeople
        FROM 
            (SELECT 
                State AS "State",
                Year AS "Year",
                IncomeBracket AS "Income Bracket",
                NumPeople AS "Number of Returns",
                RANK() OVER (PARTITION BY State, Year ORDER BY NumPeople DESC) AS Rank
            FROM IncomeDistribution)
        WHERE 
            Rank = 1
        ORDER BY 
            State, Year 
              `;
        }
    else if (queryID == 5) {  // Query 5: How does income distribution across income brackets change over time in different states?
        query = `
        SELECT
        State AS "State",
        EXTRACT(YEAR FROM DateOf) AS "Year",
        CASE 
            WHEN AGI_stub IN (1, 2) THEN 'Low Income'
            WHEN AGI_stub IN (3, 4) THEN 'Middle Income'
            WHEN AGI_stub IN (5, 6) THEN 'High Income'
        END AS "Income Bracket",
        SUM(NumReturns) AS "Num of People" -- Total number of people in each income group
        FROM
            "SAM.GROSSER".SOI_TAXSTATS
        WHERE 
            dateof BETWEEN TO_DATE('01/01/' || :startYear, 'MM/DD/YYYY') 
                      AND TO_DATE('01/01/' || :endYear, 'MM/DD/YYYY') 
            ${statesArray.length > 0 ? `AND State IN (${placeholders})` : ""}
        GROUP BY
            State, EXTRACT(YEAR FROM DateOf), 
            CASE 
                WHEN AGI_stub IN (1, 2) THEN 'Low Income'
                WHEN AGI_stub IN (3, 4) THEN 'Middle Income'
                WHEN AGI_stub IN (5, 6) THEN 'High Income'
            END
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