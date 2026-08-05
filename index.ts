import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

// config
import "./config/passportConfig"
import "./config/redisConfig"

// routers
import { authRouter } from "./routers/authRouter"

const app = express();

const allowedOrigins = [
    'http://localhost:5173',
];

app.use(cors({
    origin: function(origin, cb) {
        if(!origin || allowedOrigins.includes(origin)) {
            return cb(null, true);
        }
        const msg = "The CORS policy for this site does not allow access from the specified Origin."
        return cb(new Error(msg), false);
    },
    credentials: true
}));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

// routes
app.get("/api", (req, res) => res.status(200).json({message: "Welcome to the API."}));
app.use("/api/auth", authRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on Port ${PORT}`));