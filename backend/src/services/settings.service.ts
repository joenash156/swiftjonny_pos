import { RowDataPacket } from "mysql2";
import { Executor, POSSettings } from "../types/types";

// function to get POS settings
export async function getPOSSettings(executor: Executor): Promise<POSSettings> {

  const [settingsRow] = await executor.query<RowDataPacket[]>("SELECT tax_percent, discount_percent, receipt_header, receipt_footer FROM settings LIMIT 1");

  if(settingsRow.length === 0) {
    throw new Error("POS Settings not configured!");
  }

  const settings = settingsRow[0]!;
  
  return {
    tax_percent: Number(settings.tax_percent),
    discount_percent: Number(settings.discount_percent),
    receipt_header: settings.receipt_header,
    receipt_footer: settings.receipt_footer
  }
}