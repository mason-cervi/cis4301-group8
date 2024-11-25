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

    if (queryID == 1) {
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
    
    else if (queryID == 2) {
        query = `
        SELECT 
        State as "State",
        ZipCode as "ZIP Code",
        EXTRACT(YEAR FROM DateOf) AS "Year", -- Extract year using EXTRACT
        SUM(EnergyTaxCreditAmount) AS "Total Energy Credits Amount", 
        SUM(NumOfEnergyTaxCredits) AS "Total Number Of Energy Credits",
        CASE
            WHEN COUNT(*) > 0 THEN ROUND((SUM(NumOfEnergyTaxCredits) * 1.0 / COUNT(*)), 3)
            ELSE 0
        END AS "Uptake Rate", -- Percentage of returns with energy tax credits
        CASE
            WHEN SUM(NumOfEnergyTaxCredits) > 0 THEN ROUND((SUM(EnergyTaxCreditAmount) * 1.0 / SUM(NumOfEnergyTaxCredits)),3)
            ELSE 0
        END AS "Average Energy Credit Amount" -- Average credit amount per claim
      FROM 
        "SAM.GROSSER".SOI_TAXSTATS
        WHERE dateof BETWEEN TO_DATE('01/01/' || :startYear, 'MM/DD/YYYY') AND TO_DATE('01/01/' || :endYear, 'MM/DD/YYYY') 
        ${statesArray.length > 0 ? `AND State IN (${placeholders})` : ""}
      GROUP BY 
        State, ZipCode, EXTRACT(YEAR FROM DateOf) -- Use EXTRACT in GROUP BY
      ORDER BY 
        State, "Year", ZipCode
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