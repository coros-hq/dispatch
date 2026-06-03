import express from "express";
import smtpVerify from "./api/smtp-verify";
import sendCampaign from "./api/send-campaign";

const app = express();
app.use(express.json());

app.post("/api/smtp-verify", smtpVerify);
app.post("/api/send-campaign", sendCampaign);

app.listen(3001, () =>
  console.log("API server running on http://localhost:3001"),
);
