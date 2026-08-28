import User from "../models/customer.models";
import bcrypt from "bcrypt";

export const registerUser = async (req, res) => {
    try {
        const { fullname, email, password, phone } = req.body;
        if (!fullname || !email || !password || !phone) {
            return res.status(400).json({ message: "All fields are mandatory." });
        }
        const emailExists = User.findOne({ email })

        if (emailExists) {
            return res.status(409).json({ message: "The email is already registered" });
        }

        if (password.lenght < 6) {
            return res.status(400).json({ message: "Password must be of 6 characters." })
        }

        const hashedPassword = await bcrypt.hash(password, 10);


        const newUser = await User.create({ fullname, email, password: hashedPassword, phone });

        res.status(201).json({
            success: true,
            message: "Customer registered successfully",
            customer: newUser
        })
    } catch (error) {
        res.status(500).json(error);
    }

}

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body

        const customer = async User.findOne({ email });

        if (!customer) {
            return res.status(400).json({ message: "User not registered" })
        }


    } catch (error) {
        return res.status(500).json(error);
    }




}