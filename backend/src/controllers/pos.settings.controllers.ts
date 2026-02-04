import db from "../configs/database";
import { Request, Response } from "express"
import { ResultSetHeader, RowDataPacket } from "mysql2"; 
import { ZodError } from "zod";
import { updatePOSSettingsSchema } from "../validators/pos.settings.schema";


// controller to change/update pos settings
export const updatePOSSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    // get validated data
    const validatedPOSSettingsData = updatePOSSettingsSchema.parse(req.body);
    const { tax_percent, discount_percent, receipt_header, receipt_footer } = validatedPOSSettingsData;

    // check if there is a configured
    const [settingsRow] = await db.query<RowDataPacket[]>("SELECT id FROM settings LIMIT 1");

    if(settingsRow.length === 0) {
      res.status(404).json({
        success: false,
        error: "POS settings is not yet configured!"
      });
      return;
    }

    const fields: string[] = [];
    const values: (string | string[] | number | undefined)[] = [];

    if(tax_percent !== undefined) {
      fields.push("tax_percent = ?");
      values.push(tax_percent);
    }
    if(discount_percent !== undefined) {
      fields.push("discount_percent = ?");
      values.push(discount_percent);
    }
    if(receipt_header !== undefined) {
      fields.push("receipt_header = ?");
      values.push(receipt_header);
    }
    if(receipt_footer !== undefined) {
      fields.push("receipt_footer = ?");
      values.push(receipt_footer);
    }

    if(fields.length === 0) {
      res.status(400).json({
        success: false,
        error: "No field provided to update POS settings"
      });
      return;
    }

    values.push(settingsRow[0]!.id);

    const [result] = await db.query<ResultSetHeader>(`UPDATE settings SET ${fields.join(", ")}`, values);

    if(result.affectedRows === 0) {
      res.status(404).json({
        success: false,
        error: "Unable to update POS settings"
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Updated POS settings successfully!✅"
    })

  } catch(err: unknown) {
      if (err instanceof ZodError) {
        res.status(400).json({
          success: false,
          error: "Invalid request data",
          issues: err.issues,
        });
        return;
      }

      console.error("Failed to update POS settings: ", err);
      res.status(500).json({
        success: false,
        error: "Internal server error while updating POS Settings"
      });
      return;
    }
}
