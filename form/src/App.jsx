import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle, Users, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const WaitlistForm = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [position, setPosition] = useState(null);
  const [waitlistCount, setWaitlistCount] = useState(0);

  useEffect(() => {
    // Fetch current waitlist count
    fetch("http://127.0.0.1:5000/api/waitlist/count/")
      .then((res) => res.json())
      .then((data) => setWaitlistCount(data.count))
      .catch(console.error);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const response = await fetch("http://127.0.0.1:5000/api/waitlist/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus("success");
        setMessage("You have been added to the waitlist!");
        setPosition(data.position);
        setName("");
        setEmail("");
        setWaitlistCount((prev) => prev + 1);
      } else {
        setStatus("error");
        setMessage(data.error || "Something went wrong. Please try again.");
      }
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      setStatus("error");
      setMessage("Unable to connect to server. Please try again later.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-400 to-gray-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="w-full max-w-md backdrop-blur-sm bg-white/90 shadow-xl border-0">
          <CardHeader className="space-y-1">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
              }}
            >
              <div className="flex items-center justify-center mb-4">
                <Sparkles className="w-10 h-10 text-gray-500" />
              </div>
              <CardTitle className="text-2xl text-center bg-gradient-to-r from-gray-600 to-gray-600 bg-clip-text text-transparent">
                Join the Waitlist
              </CardTitle>
            </motion.div>
            <CardDescription className="text-center">
              Join {waitlistCount.toLocaleString()} others waiting to experience
              something amazing!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full transition-all duration-200 border-purple-100 focus:border-purple-300"
                />
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Input
                  type="email"
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full transition-all duration-200 border-purple-100 focus:border-purple-300"
                />
              </motion.div>

              <AnimatePresence>
                {status === "success" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <Alert className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <AlertTitle>Success!</AlertTitle>
                      <AlertDescription>
                        {message}
                        {position && (
                          <div className="mt-2 text-sm">
                            You are #{position} on the waitlist!
                          </div>
                        )}
                      </AlertDescription>
                    </Alert>
                  </motion.div>
                )}

                {status === "error" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{message}</AlertDescription>
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-gray-600 to-gray-600 hover:from-gray-400 hover:to-gray-700 transition-all duration-200"
                  disabled={status === "loading"}
                >
                  {status === "loading" ? "Joining..." : "Join Waitlist"}
                </Button>
              </motion.div>
            </form>

            <div className="mt-6 text-center text-sm text-gray-500 flex items-center justify-center gap-2">
              <Users size={16} />
              <span>{waitlistCount.toLocaleString()} people waiting</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default WaitlistForm;
