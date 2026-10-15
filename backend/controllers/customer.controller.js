import User from "../models/customer.models.js"; import bcrypt from "bcrypt"; import genToken from "../utils/generateToken.js";

const isProduction = () => process.env.NODE_ENV === 'production';

// Cross-site deployments (frontend on Vercel, backend on Render) require
// SameSite=None so the browser sends the auth cookie on cross-origin XHR,
// and SameSite=None requires Secure (HTTPS). For same-origin/local
// development, 'lax' is the safer default. Override with COOKIE_SAMESITE if
// the frontend and backend are served from the same origin.
//
// Computed lazily (per request) so it always reflects the environment after
// dotenv has loaded, regardless of module evaluation order.
const getCookieOptions = ({ withMaxAge = true } = {}) => {
  const production = isProduction();
  const sameSite = (process.env.COOKIE_SAMESITE || (production ? 'none' : 'lax')).toLowerCase();

  const options = {
    httpOnly: true,
    sameSite,
    secure: production || sameSite === 'none',
    path: '/',
  };

  if (withMaxAge) {
    options.maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
  }

  return options;
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
      res.cookie('token', token, getCookieOptions());
      
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
      res.cookie('token', token, getCookieOptions())

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
    const clearOptions = getCookieOptions({ withMaxAge: false });
    res.clearCookie('token', clearOptions);
    res.cookie('token', '', { ...clearOptions, expires: new Date(0) });
    res.status(200).json({
      success: true,
      message: "Logged out successfully"
    });
  } catch (err) {
    return res.status(500).json({ message: "The error is + " + err });
  }
};
