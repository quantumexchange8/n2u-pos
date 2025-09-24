import { useEffect, useState } from "react";

function RedirectingText() {
    const [dots, setDots] = useState("");

    useEffect(() => {
        const interval = setInterval(() => {
            setDots(prev => (prev.length < 4 ? prev + "." : ""));
        }, 500); // change every 0.5s

        return () => clearInterval(interval);
    }, []);

    return (
        <span className="text-lg font-semibold text-white">
            Redirecting{dots}
        </span>
    );
}

export default RedirectingText;
