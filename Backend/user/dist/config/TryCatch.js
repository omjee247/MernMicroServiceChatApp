// const tryCatch = (handler : RequestHandler): RequestHandler => {
//   return (req, res, next) => {
// 	Promise.resolve(handler(req, res, next)).catch((error) => {
// 	  console.error("Error occurred:", error);
// 	  res.status(500).json({ error: "Internal Server Error" });
// 	});
//   };
// };
const tryCatch = (handler) => {
    return async (req, res, next) => {
        try {
            await handler(req, res, next);
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    };
};
export default tryCatch;
//# sourceMappingURL=TryCatch.js.map