import ImageFiles from "../Models/ImageFile";
import PDFFiles from "../Models/PDFFile";
import Workspace from "../Models/Workspace";

const RateLimitMiddleware ={
    workspaceRateLimit: async (req: any, res: any, next: any) => {
        const user = req.user;

        if(user.plan == 'Free'){
            const workspaces = await Workspace.findAll({ where: { userId: user.id } });
            if (workspaces.length >= 3) {
                return res.status(429).json({ message: 'Workspace limit reached.' });
            }   
        }
        else if(user.plan == 'Paid'){
            const workspaces = await Workspace.findAll({ where: { userId: user.id } });
            if (workspaces.length >= 10) {
                return res.status(429).json({ message: 'Workspace limit reached.' });
            }   
        }

        next();
    },

    fileUploadRateLimit: async (req: any, res: any, next: any) => {
        const user = req.user;
        const { workspace_id } = req.body;

        if(user.plan == 'Free'){
            const fileUploads = await PDFFiles.findAll({ where: { userId: user.id, workspaceId: workspace_id } });
            const imageFiles = await ImageFiles.findAll({ where: { userId: user.id, workspaceId: workspace_id } });

            const totalLength = fileUploads.length + imageFiles.length;
            console.log(totalLength)
            if (totalLength >= 2) {
                return res.status(429).json({ message: 'File upload limit reached.' });
            }
        }
        else if(user.plan == 'Paid'){
            const fileUploads = await PDFFiles.findAll({ where: { userId: user.id, workspaceId: workspace_id } });
            const imageFiles = await ImageFiles.findAll({ where: { userId: user.id, workspaceId: workspace_id } });

            const totalLength = fileUploads.length + imageFiles.length;
            if (totalLength >= 5) {
                return res.status(429).json({ message: 'File upload limit reached.' });
            }
        }

        next();
    }
}
export default RateLimitMiddleware;