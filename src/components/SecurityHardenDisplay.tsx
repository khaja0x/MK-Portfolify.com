import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SecurityHardenDisplay = () => {
    const [show, setShow] = useState(true);
    const [text, setText] = useState("");
    const fullText = "Welcome to Portfolify | Your professional story starts here.";

    useEffect(() => {
        let index = 0;
        const interval = setInterval(() => {
            setText(fullText.slice(0, index));
            index++;
            if (index > fullText.length) {
                clearInterval(interval);
                setTimeout(() => setShow(false), 2000);
            }
        }, 30); // Fast typing

        return () => clearInterval(interval);
    }, []);

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="fixed inset-0 z-[9999] bg-slate-950 flex items-center justify-center p-6"
                >
                    <div className="text-center">
                        <motion.p
                            className="text-slate-400 font-mono text-sm md:text-base tracking-widest uppercase"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            {text}
                            <motion.span
                                animate={{ opacity: [1, 0] }}
                                transition={{ duration: 0.5, repeat: Infinity }}
                                className="inline-block w-2 h-4 bg-sky-500 ml-1 translate-y-0.5"
                            />
                        </motion.p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SecurityHardenDisplay;
