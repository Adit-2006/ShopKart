import User from "../models/customer.models.js"; import bcrypt from "bcrypt"; import genToken from "../utils/generateToken.js";

const cookieOption = {
  httpOnly: true,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
};


export const registerUser = async (req, res) => {
    try{
        const { fullname, email, password, phone } = req.body;
        if (!fullname || !email || !password || !phone) {
            return res.status(400).json({ message: "All fields are mandatory." });
        }
          const emailExists = await User.findOne({ email })
  
          if (emailExists) {
              return res.status(409).json({ message: "The email is already registered" });
          }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be of 6 characters." })
        }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const newUser = await User.create({
        fullname,
        email,
        password: hashedPassword,
        phone,
      });

      
      const token = genToken(newUser._id);
      res.cookie('token', token, cookieOption);
      
      res.status(201).json({
          success: true,
          message: "Customer registered successfully",
          customer: {
            _id: newUser._id,
            fullname: newUser.fullname,
            email: newUser.email,
            phone: newUser.phone,
            wishlist: newUser.wishlist || [],
            cart: newUser.cart || []
          }
      });
    } catch (error) {
      console.error("Error in registerUser:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to register customer",
      });
    }

}

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body

        const customer = await User.findOne({ email })

        if (!customer) {
            return res.status(400).json({ message: "User not registered" })
        }
      const passCheck = await bcrypt.compare(password, customer.password)
      if (!passCheck) {
        return res.status(401).json({message: "Credentials do not match."})
      }

      const token = genToken(customer._id)
      res.cookie('token', token, cookieOption)

      res.status(200).json({
        success: true,
        message: "Login Successful.",
        customer: {
          _id: customer._id,
          fullname: customer.fullname,
          email: customer.email,
          phone: customer.phone,
          wishlist: customer.wishlist || [],
          cart: customer.cart || []
        }
      })

    } catch (error) {
      console.error("Error in loginUser:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to login",
      });
    }
}

export const getUser = (req, res) => {
  res.status(200).json(req.user);
}

export const logoutUser = (req, res) => {
  try {
    res.clearCookie('token');
    res.status(200).json({
      success: true,
      message: "Logged out successfully"
    })    
  }
  catch (err) {
    return res.status(500).json({message: "The error is + " + err})
  }

}
