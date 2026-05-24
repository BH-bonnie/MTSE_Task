const User = require("../models/user");
const bcrypt = require("bcrypt");

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password").lean();
        const mappedUsers = users.map(u => ({
            ...u,
            id: u._id,
            firstName: u.name,
            lastName: ""
        }));
        res.status(200).json({ users: mappedUsers });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password").lean();
        if (!user) return res.status(404).json({ message: "User not found" });
        const mappedUser = {
            ...user,
            id: user._id,
            firstName: user.name,
            lastName: ""
        };
        res.status(200).json({ user: mappedUser });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createUser = async (req, res) => {
    try {
        const { username, email, firstName, lastName, address, gender, phone, avatar, role, isActive, isLocked, password } = req.body;
        const existingEmail = await User.findOne({ email });
        if (existingEmail) return res.status(400).json({ message: "Email already exists" });

        const hashPassword = await bcrypt.hash(password || "123456", 10);
        const name = [firstName, lastName].filter(Boolean).join(" ").trim() || username || email;

        const newUser = await User.create({
            username, 
            email, 
            password: hashPassword, 
            name, 
            address, 
            gender: gender === "true" ? true : gender === "false" ? false : null, 
            phone, 
            avatar, 
            role, 
            isActive: isActive === "true" || isActive === true, 
            isLocked: isLocked === "true" || isLocked === true
        });

        res.status(201).json({ message: "Created", user: newUser });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateUser = async (req, res) => {
    try {
        const { username, email, firstName, lastName, address, gender, phone, avatar, role, isActive, isLocked, password } = req.body;
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        const name = [firstName, lastName].filter(Boolean).join(" ").trim() || username;

        user.username = username || user.username;
        user.email = email || user.email;
        if (name) user.name = name;
        user.address = address;
        user.gender = gender === "true" ? true : gender === "false" ? false : null;
        user.phone = phone;
        user.avatar = avatar;
        if (role) user.role = role;
        user.isActive = isActive === "true" || isActive === true;
        user.isLocked = isLocked === "true" || isLocked === true;

        if (password) {
            user.password = await bcrypt.hash(password, 10);
        }

        await user.save();
        res.status(200).json({ message: "Updated", user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteUser = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getAllUsers, getUserById, createUser, updateUser, deleteUser };
