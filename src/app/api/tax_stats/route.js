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
          State, EXTRACT(YEAR FROM DateOf)
        ORDER BY
          State, EXTRACT(YEAR FROM DateOf)
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
            State, EXTRACT(YEAR FROM DateOf)
          `;
    }
    else if (queryID == 3) { // Query 3: how does inflation impact purchasing power and take home pay over time?
        query = `
        WITH WeightedIncome AS (
        SELECT 
            EXTRACT(YEAR FROM t.DateOf) AS Year,
            t.State AS State,
            t.AGI_stub AS IncomeBracket,
            SUM(CASE 
              WHEN t.AGI_stub = 1 THEN 12500
              WHEN t.AGI_stub = 2 THEN 37500
              WHEN t.AGI_stub = 3 THEN 62500
              WHEN t.AGI_stub = 4 THEN 87500
              WHEN t.AGI_stub = 5 THEN 150000
              WHEN t.AGI_stub = 6 THEN 500000
          END * t.NumReturns) AS TotalNominalIncome,
            SUM(t.NumReturns) AS TotalReturns
        FROM 
            "SAM.GROSSER".SOI_TaxStats t
        WHERE 
            dateof BETWEEN TO_DATE('01/01/' || :startYear, 'MM/DD/YYYY') 
                    AND TO_DATE('01/01/' || :endYear, 'MM/DD/YYYY')
            ${statesArray.length > 0 ? `AND State IN (${placeholders})` : ""}
        GROUP BY 
            EXTRACT(YEAR FROM t.DateOf), t.State, t.AGI_stub
        ),
        InflationAdjusted AS (
            SELECT 
                w.Year,
                w.State,
                w.IncomeBracket,
                w.TotalNominalIncome,
                c.CPIAUCSL AS CPI,
                (w.TotalNominalIncome / (c.CPIAUCSL / 214.56)) AS RealIncome
            FROM 
                WeightedIncome w
            JOIN 
                "SAM.GROSSER".ConsumerPriceIndex c 
                ON w.Year = EXTRACT(YEAR FROM c.DateOf)
        )
        SELECT 
            Year AS "Year",
            State AS "State",
            IncomeBracket AS "Income Bracket",
            ROUND(TotalNominalIncome, 2) AS "Total Nominal Income", 
            ROUND(RealIncome, 2) AS "Total Real Income",
            ROUND(CPI, 2) AS "CPI"
        FROM 
            InflationAdjusted
        ORDER BY 
            "Year", "State", "Income Bracket"
        `;
    }
    // else if (queryID == 4) {  // Query 4: Fed funds rate impact sector wise income trends over time?
    // query = `
    // WITH IncomeDistribution AS (
    //     SELECT
    //         State,
    //         EXTRACT(YEAR FROM DateOf) AS "Year",
    //         CASE
    //             WHEN AGI_stub IN (1, 2) THEN 'Low Income'
    //             WHEN AGI_stub IN (3, 4) THEN 'Middle Income'
    //             WHEN AGI_stub IN (5, 6) THEN 'High Income'
    //         END AS IncomeBracket,
    //         SUM(NumReturns) AS NumPeople,
    //         AGI_stub
    //     FROM
    //         "SAM.GROSSER".SOI_TAXSTATS
    //     WHERE
    //         dateof BETWEEN TO_DATE('01/01/' || :startYear, 'MM/DD/YYYY')
    //                   AND TO_DATE('01/01/' || :endYear, 'MM/DD/YYYY')
    //         ${statesArray.length > 0 ? `AND State IN (${placeholders})` : ""}
    //     GROUP BY
    //         State, EXTRACT(YEAR FROM DateOf),
    //         CASE
    //             WHEN AGI_stub IN (1, 2) THEN 'Low Income'
    //             WHEN AGI_stub IN (3, 4) THEN 'Middle Income'
    //             WHEN AGI_stub IN (5, 6) THEN 'High Income'
    //         END,
    //         AGI_stub
    // )
    // SELECT
    //     "State",
    //     "Year",
    //     SUM(CASE WHEN IncomeBracket = 'Low Income' THEN NumPeople END) AS "Low Income",
    //     SUM(CASE WHEN IncomeBracket = 'Middle Income' THEN NumPeople END) AS "Middle Income",
    //     SUM(CASE WHEN IncomeBracket = 'High Income' THEN NumPeople END) AS "High Income"
    // FROM
    //     IncomeDistribution
    // GROUP BY
    //     "State", "Year"
    // ORDER BY
    //     "State", "Year"
    // `;
    // }
    // else if (queryID == 5) {  // Query 5: How does income distribution across income brackets change over time in different states?
    // query = `
    // WITH IncomeBrackets AS (
    //     SELECT
    //         State,
    //         EXTRACT(YEAR FROM DateOf) AS "Year",
    //         CASE
    //             WHEN AGI_stub IN (1, 2) THEN 'Low Income'
    //             WHEN AGI_stub IN (3, 4) THEN 'Middle Income'
    //             WHEN AGI_stub IN (5, 6) THEN 'High Income'
    //         END AS IncomeBracket,
    //         AGI_stub,
    //         NumReturns
    //     FROM
    //         "SAM.GROSSER".SOI_TAXSTATS
    //     WHERE
    //         dateof BETWEEN TO_DATE('01/01/' || :startYear, 'MM/DD/YYYY')
    //                 AND TO_DATE('01/01/' || :endYear, 'MM/DD/YYYY')
    //         ${statesArray.length > 0 ? `AND State IN (${placeholders})` : ""}
    // )
    // SELECT
    //     State AS "State",
    //     "Year",
    //     SUM(CASE WHEN IncomeBracket = 'Low Income' THEN NumReturns END) AS "Low Income",
    //     SUM(CASE WHEN IncomeBracket = 'Middle Income' THEN NumReturns END) AS "Middle Income",
    //     SUM(CASE WHEN IncomeBracket = 'High Income' THEN NumReturns END) AS "High Income"
    // FROM
    //     IncomeBrackets
    // GROUP BY
    //     State, "Year"
    // ORDER BY
    //     State, "Year"
    // `;
        // }
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
            "State",
            "Year",
            "Income Bracket",
            "Number of Returns"

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
            "State", "Year" 
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
        SUM(NumReturns) AS "Number of People" -- Total number of people in each income group

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