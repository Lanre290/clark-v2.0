import { Request, Response } from "express";
import { afterVerificationMiddlerwareInterface } from "../../Interfaces/Index";
import Workspace from "../../Models/Workspace";
import { v5 as uuidv5 } from "uuid";
import Chats from "../../Models/Chat";

export const createWorkspace = async (
    req: Request & afterVerificationMiddlerwareInterface,
    res: Response
  ) => {
    let { name, description, tag } = req.body;
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: "Unauthorized access." });
    }

    if (!name) {
      name = null;
    }

    try {
      if (name) {
        const workspaceExists = await Workspace.findOne({
          where: { name, userId: user.id },
        });
        if (workspaceExists) {
          return res
            .status(422)
            .json({ error: `A workspace named '${name}' exists.` });
        }
      }

      Workspace.create({
        name: name,
        description: description,
        tag: tag,
        userId: user.id,
      })
        .then(async (workspace) => {
          const hashedWorkspaceId = uuidv5(
            workspace.id.toString(),
            process.env.UUID_SECRET as string
          );

          const chat = await Chats.create({
            userId: user.id,
            workspaceId: hashedWorkspaceId,
          });

          await Workspace.update(
            { enc_id: hashedWorkspaceId },
            { where: { id: workspace.id } }
          );

          return res.status(201).json({
            success: true,
            message: "Workspace created successfully.",
            workspace_id: hashedWorkspaceId,
            name: workspace.name,
            chat,
          });
        })
        .catch((error) => {
          console.error("Error creating workspace:", error);
          return res.status(500).json({
            error: "Server error.",
            message: "Error creating workspace.",
          });
        });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Server error." });
    }
  }