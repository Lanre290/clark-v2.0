import { Request, Response } from "express";
import { afterVerificationMiddlerwareInterface } from "../../Interfaces/Index";
import Workspace from "../../Models/Workspace";

export const renameWorkspace = async (req: Request & afterVerificationMiddlerwareInterface, res: Response) => {
  const { newName, workspaceId } = req.body;

  try {
    await Workspace.update({ name: newName }, { where: { enc_id: workspaceId } });
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to rename workspace" });
  }
};
