import { generateMaterial } from "../Controllers/userActions/generateMaterial.controller";
import ImageFiles from "../Models/ImageFile";
import PDFFiles from "../Models/PDFFile";
import User from "../Models/User";
import Workspace from "../Models/Workspace";

const RateLimitMiddleware ={
    workspaceRateLimit: async (req: any, res: any, next: any) => {
        if(!req.user){
            return res.status(401).json({ message: 'Unauthorized access.' });
        }
        const user = req.user;

        if(user.plan == 'Free'){
            const workspaces = await Workspace.findAll({ where: { userId: user.id } });

            if (workspaces.length >= 3) {
                return res.status(402).json({ message: 'Workspace limit reached.' });
            }   
        }
        else if(user.plan == 'Paid'){
            const workspaces = await Workspace.findAll({ where: { userId: user.id } });
            if (workspaces.length >= 10) {
                return res.status(402).json({ message: 'Workspace limit reached.' });
            }   
        }

        next();
    },

    fileUploadRateLimit: async (req: any, res: any, next: any) => {
    try {
        const user = req.user;
        const { workspace_id } = req.body;
        const files = req.files;

        if (!workspace_id) {
            return res.status(400).json({ 
                error: "Missing workspace_id." 
            });
        }

        if (user.plan == 'Free' || user.plan == 'Paid') {
            const limit = user.plan == 'Free' ? 2 : 5;

            
            const [pdfCount, imageCount] = await Promise.all([
                PDFFiles.count({ where: { userId: String(user.id), workspaceId: String(workspace_id) } }),
                ImageFiles.count({ where: { userId: String(user.id), workspaceId: String(workspace_id) } })
            ]);

            if ((pdfCount + imageCount + files.length) > limit) {
                return res.status(403).json({ message: 'File upload limit reached.' + (user.plan == 'Free' ? 'You can only upload 2 files in a workspace, upgrade to do more!' : 'You can only upload 5 files in a workspace, upgrade to do more!') });
            }
        }

        next();
    } catch (error) {
        console.error("Rate Limit Middleware Error:", error);
        return res.status(500).json({ error: "Internal server error during validation." });
    }
    },

    generateMaterialRateLimit: async (req: any, res: any, next: any) => {
        try {
            const { file_ids } = req.body;
            const user = req.user;

            if(file_ids && file_ids.length > 0 && user.plan == 'Free'){
                return res.status(403).json({ message: 'Material generation with file context is not allowed in the Free plan. Please upgrade to use this feature.' });
            }

            next();
        } catch (error) {
            console.error("Rate Limit Middleware Error:", error);
            return res.status(500).json({ error: "Internal server error during validation." });
        }
    },

}
export default RateLimitMiddleware;