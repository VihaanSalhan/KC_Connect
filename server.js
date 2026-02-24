import mongoose from "mongoose";
import bcrypt from "bcryptjs";

let conn = null;

async function connectDB() {
  if (conn) return;
  conn = await mongoose.connect(process.env.MONGO_URL);
}

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  friends: [String],
  requests: [String]
});

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default async function handler(req, res) {
  await connectDB();

  if (req.method === "POST") {
    const { action } = req.body;

    if (action === "signup") {
      const { username, password } = req.body;
      const existing = await User.findOne({ username });
      if (existing) return res.json({ message: "User exists" });

      const hashed = await bcrypt.hash(password, 10);
      await User.create({
        username,
        password: hashed,
        friends: [],
        requests: []
      });

      return res.json({ message: "Account created" });
    }

    if (action === "login") {
      const { username, password } = req.body;
      const user = await User.findOne({ username });
      if (!user) return res.json({ message: "User not found" });

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) return res.json({ message: "Wrong password" });

      return res.json({
        message: "Login success",
        friends: user.friends,
        requests: user.requests
      });
    }

    if (action === "addfriend") {
      const { from, to } = req.body;
      const user = await User.findOne({ username: to });
      if (!user) return res.json({ message: "User not found" });

      if (!user.requests.includes(from)) {
        user.requests.push(from);
        await user.save();
      }

      return res.json({ message: "Request sent" });
    }

    if (action === "accept") {
      const { username, friend } = req.body;
      const user = await User.findOne({ username });
      const friendUser = await User.findOne({ username: friend });

      user.friends.push(friend);
      friendUser.friends.push(username);
      user.requests = user.requests.filter(r => r !== friend);

      await user.save();
      await friendUser.save();

      return res.json({ message: "Friend added" });
    }
  }

  res.status(404).json({ message: "Not found" });
}