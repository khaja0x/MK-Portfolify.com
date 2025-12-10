import express from "express";
import Joi from "joi";
import rateLimit from "express-rate-limit";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const schema = Joi.object({
    name: Joi.string().min(2).required(),
    email: Joi.string().email().required(),
    subject: Joi.string().min(3).required(),
    message: Joi.string().min(10).required(),
});

const limiter = rateLimit({ windowMs: 60 * 1000, max: 6 });

router.post("/", limiter, async (req, res) => {
    const { error, value } = schema.validate(req.body);
    if (error) return res.status(400).json({ success: false, error: error.details[0].message });

    const { name, email, subject, message } = value;

    const { data, error: insertErr } = await supabase
        .from("contacts")
        .insert([{ name, email, subject, message }])
        .select();

    if (insertErr) {
        console.error("Supabase insert error:", insertErr);
        return res.status(500).json({ success: false, error: "DB error" });
    }

    return res.json({ success: true, data: data[0] });
});

// GET all messages (for Admin)
router.get("/", async (req, res) => {
    const { data, error } = await supabase
        .from("contacts")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Supabase error:", error);
        return res.status(500).json({ success: false, error: error.message });
    }
    res.json({ success: true, data });
});

// PATCH mark as read
router.patch("/:id", async (req, res) => {
    const { id } = req.params;
    const { is_read } = req.body;

    const { data, error } = await supabase
        .from("contacts")
        .update({ is_read })
        .eq("id", id)
        .select();

    if (error) {
        console.error("Supabase error:", error);
        return res.status(500).json({ success: false, error: error.message });
    }
    res.json({ success: true, data });
});

// DELETE message
router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    const { error } = await supabase.from("contacts").delete().eq("id", id);

    if (error) {
        console.error("Supabase error:", error);
        return res.status(500).json({ success: false, error: error.message });
    }
    res.json({ success: true, message: "Deleted successfully" });
});

export default router;
