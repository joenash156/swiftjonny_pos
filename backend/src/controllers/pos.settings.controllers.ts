import db from "../configs/database";
import { Request, Response } from "express"
import { ResultSetHeader, RowDataPacket } from "mysql2"; 
import { ZodError } from "zod";
import { createPOSSettingsSchema, updatePOSSettingsSchema } from "../validators/pos.settings.schema";
import { getPOSSettings } from "../services/settings.service";


// controller to create POS settings once
export const createPOSSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    // check if there is a configured
    const POSSettings = await getPOSSettings(db)

    if(POSSettings) {
      res.status(409).json({
        success: false,
        message: "POS settings already configured"
      });
      return;
    }

    // validate request body
    const validatedPOSSettingsData = createPOSSettingsSchema.parse(req.body);
    const { tax_percent, discount_percent, receipt_header, receipt_footer } = validatedPOSSettingsData;

    await db.query<ResultSetHeader>("INSERT INTO settings (tax_percent, discount_percent, receipt_header, receipt_footer) VALUES (?, ?, ?, ?)", [tax_percent, discount_percent, receipt_header, receipt_footer]);

    res.status(201).json({
      success: true,
      message: "POS settings created successfully!✅",
      settings: {
        tax_percent,
        discount_percent,
        receipt_header,
        receipt_footer
      }
    });
    return;

  } catch(err: unknown) {
      if (err instanceof ZodError) {
        res.status(400).json({
          success: false,
          error: "Invalid request data",
          issues: err.issues,
        });
        return;
      }

      console.error("Failed to create POS settings: ", err);
      res.status(500).json({
        success: false,
        error: "Internal server error while creating POS Settings"
      });
      return;
    }
}

// controller to get POS settings
export const getActivePOSSettings = async (_req: Request, res: Response): Promise<void> => {
  try {
    // get POS setting if available
    const POSSettings = await getPOSSettings(db);

    if(!POSSettings) {
      res.status(404).json({
        success: false,
        message: "POS settings not yet configured!",
        is_set: false
      });
      return;
    }

    const { tax_percent, discount_percent, receipt_header, receipt_footer } = POSSettings;

    res.status(200).json({
      success: true,
      message: "POS setting fetched successfully!✅",
      is_set: true,
      settings: {
        tax_percent,
        discount_percent,
        receipt_header,
        receipt_footer
      }
    })

  } catch(err: unknown) {
      console.error("Failed to get POS settings: ", err);
      res.status(500).json({
        success: false,
        error: "Internal server error while fetching POS Settings"
      });
      return;
    }
}

// controller to change/update pos settings
export const updatePOSSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    // get validated data
    const validatedPOSSettingsData = updatePOSSettingsSchema.parse(req.body);
    const { tax_percent, discount_percent, receipt_header, receipt_footer } = validatedPOSSettingsData;

    // check if there is a configured
    const POSSettings = await getPOSSettings(db)

    if(!POSSettings) {
      res.status(404).json({
        success: false,
        error: "POS settings not yet configured!"
      });
      return;
    }

    const { id } = POSSettings

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

    values.push(id);

    const [result] = await db.query<ResultSetHeader>(`UPDATE settings SET ${fields.join(", ")} WHERE id = ?`, values);

    if(result.affectedRows === 0) {
      res.status(404).json({
        success: false,
        error: "Unable to update POS settings"
      });
      return;
    }

    const [updated] = await db.query<RowDataPacket[]>("SELECT tax_percent, discount_percent, receipt_header, receipt_footer FROM settings WHERE id = ?", [id])

    res.status(200).json({
      success: true,
      message: "Updated POS settings successfully!✅",
      settings: {
        ...updated[0],
        tax_percent: Number(updated[0]!.tax_percent),
        discount_percent: Number(updated[0]!.discount_percent)
      }
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
