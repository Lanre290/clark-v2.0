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
    try {
        const user = req.user;
        const { workspace_id } = req.body;

        // 1. SAFETY CHECK: If the stream hasn't provided the ID yet, we can't query the DB
        if (!workspace_id) {
            return res.status(400).json({ 
                error: "Missing workspace_id. Ensure it is sent BEFORE the files in your form-data." 
            });
        }

        if (user.plan === 'Free' || user.plan === 'Paid') {
            const limit = user.plan === 'Free' ? 2 : 5;

            // 2. Optimized Database Query (Use count instead of findAll)
            // findAll loads every row into memory; count is much faster for rate limiting
            const [pdfCount, imageCount] = await Promise.all([
                PDFFiles.count({ where: { userId: String(user.id), workspaceId: String(workspace_id) } }),
                ImageFiles.count({ where: { userId: String(user.id), workspaceId: String(workspace_id) } })
            ]);

            if ((pdfCount + imageCount) >= limit) {
                return res.status(429).json({ message: 'File upload limit reached.' });
            }
        }

        next();
    } catch (error) {
        console.error("Rate Limit Middleware Error:", error);
        // 3. FAIL SAFE: If the DB is down or something breaks, don't let the app hang
        return res.status(500).json({ error: "Internal server error during validation." });
    }
}
}
export default RateLimitMiddleware;