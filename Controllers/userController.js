// import Address from "../models/Address.js";
// import User from "../models/user.js";
// import bcrypt from "bcryptjs";

// export const userRegister = async (req, res) => {
//     try{

//         const { username, email, password, profilePicture, phone, location, favorites, orders, role,
//              isActive, preferredMilk, isVerified } = req.body


//         if (!username?.firstName || !email || !password || !phone || !location?.coordinates || !location?.address) {
//             return res.status(400).json({ message: "Missing required fields" });
//         }

//         const existingUser = await User.findOne({email})
//         if(existingUser){
//             return res.status(400).json({message: "Email already exists. Please use a different email."})
//         }

//         // Hash the password
//         const hashedPassword = await bcrypt.hash(password, 10);

//         // Replace the plain text password with the hashed one
//         req.body.password = hashedPassword;


//         const newUser = await User.create({
//             username, email, password, profilePicture, phone, location, favorites, orders, role,
//              isActive, preferredMilk, isVerified
//         })
//         res.status(201).json({message: "User registered successfully", user: newUser})
//     } catch (error) {
//         res.status(500).json({message: "Error registering user", error: error.message})
//     }
// }

// export const userAddress = async(req, res) => {
//     try{
//         const { user, label, fullAddress, location } = req.body;

//         if(!user || !fullAddress || !location?.coordinates){
//             return res.status(400).json({message: "user, fullAddress and location.coordinates are required"})
//         }

//         const address = await Address.create({
//             user,
//             label,
//             fullAddress,
//             location: {
//                 type: "Point",
//                 coordinates: location.coordinates
//             }
//         })
//         res.status(201).json({message: "Address added successfully",
//             address
//         })
//     }
//     catch(error){
//         console.error("Error adding address", error);
//         res.status(500).json({
//             message: "Error adding address",
//             error: error.message
//         })
//     }
// }






// import Address from "../models/Address.js";
// import User from "../models/user.js";
// import Dairy from "../models/dairy.js";
// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";
// import crypto from "crypto";
// import sendEmail from "../utils/sendEmail.js";

// // ─── Helper: Generate JWT Token ───────────────────────────────────
// const generateToken = (id) => {
//     return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
// };

// // @desc    Register a new user
// // @route   POST /api/auth/register
// // @access  Public
// export const userRegister = async (req, res) => {
//     try {
//         const {
//             username, email, password, profilePicture,
//             phone, location, favorites, role, preferredMilk
//         } = req.body;

//         // Validate required fields
//         if (!username?.firstName || !email || !password || !phone || !location?.coordinates || !location?.address) {
//             return res.status(400).json({ success: false, message: "Missing required fields" });
//         }

//         // Check if user already exists
//         const existingUser = await User.findOne({ email });
//         if (existingUser) {
//             return res.status(400).json({ success: false, message: "Email already exists. Please use a different email." });
//         }

//         // Hash password
//         const hashedPassword = await bcrypt.hash(password, 10);

//         // Create user
//         const newUser = await User.create({
//             username,
//             email,
//             password: hashedPassword,
//             profilePicture,
//             phone,
//             location,
//             favorites,
//             role,
//             preferredMilk
//         });

//         // Generate token
//         const token = generateToken(newUser._id);


//         // Return user without password
//         const userResponse = newUser.toObject();
//         delete userResponse.password;

//         res.status(201).json({
//             success: true,
//             message: "User registered successfully",
//             token,
//             user: userResponse
//         });

//     } catch (error) {
//         res.status(500).json({ success: false, message: "Error registering user", error: error.message });
//     }
// };

// // @desc    Login user
// // @route   POST /api/auth/login
// // @access  Public
// export const userLogin = async (req, res) => {
//     try {
//         const { email, password } = req.body;

//         if (!email || !password) {
//             return res.status(400).json({ success: false, message: "Email and password are required" });
//         }

//         // Find user and include password for comparison
//         const user = await User.findOne({ email }).select('+password');
//         if (!user) {
//             return res.status(401).json({ success: false, message: "Invalid email or password" });
//         }

//         // Check if account is active
//         if (!user.isActive) {
//             return res.status(403).json({ success: false, message: "Your account has been deactivated. Please contact support." });
//         }

//         // Compare password
//         const isMatch = await bcrypt.compare(password, user.password);
//         if (!isMatch) {
//             return res.status(401).json({ success: false, message: "Invalid email or password" });
//         }

//         // Generate token
//         const token = generateToken(user._id);

//         // Return user without password
//         const userResponse = user.toObject();
//         delete userResponse.password;

//         res.status(200).json({
//             success: true,
//             message: "Login successful",
//             token,
//             user: userResponse
//         });

//     } catch (error) {
//         res.status(500).json({ success: false, message: "Error logging in", error: error.message });
//     }
// };

// // @desc    Get logged in user profile
// // @route   GET /api/auth/profile
// // @access  Private
// export const getProfile = async (req, res) => {
//     try {
//         if(!req.user || !req.user._id){
//             return res.status(401).json({ success: false, message: "Unauthorized" });
//         }
//         const user = await User.findById(req.user._id)
//             .select('-password')
//             .populate('orders');

//         if (!user) {
//             return res.status(404).json({ success: false, message: "User not found" });
//         }

//         res.status(200).json({ success: true, data: user });

//     } catch (error) {
//         res.status(500).json({ success: false, message: "Error fetching profile", error: error.message });
//     }
// };

// // @desc    Update user profile
// // @route   PUT /api/auth/profile
// // @access  Private
// export const updateProfile = async (req, res) => {
//     try {
//         const { username, email, phone, profilePicture, location, favorites, preferredMilk } = req.body;

//         // Prevent updating sensitive fields
//         const updates = {};
//         if (username) updates.username = username;
//         if (email) updates.email = email;
//         if (phone) updates.phone = phone;
//         if (profilePicture) updates.profilePicture = profilePicture;
//         if (location) updates.location = location;
//         if (favorites) updates.favorites = favorites;
//         if (preferredMilk) updates.preferredMilk = preferredMilk;

//         const updatedUser = await User.findByIdAndUpdate(
//             req.user._id,
//             updates,
//             { new: true, runValidators: true }
//         ).select('-password');

//         res.status(200).json({ success: true, message: "Profile updated successfully", data: updatedUser });

//     } catch (error) {
//         res.status(500).json({ success: false, message: "Error updating profile", error: error.message });
//     }
// };

// // @desc    Upgrade the current account to a dairy owner
// // @route   PATCH /api/user/become-dairy-owner
// // @access  Private
// // This is its OWN endpoint rather than an updateProfile field on purpose —
// // role must never be settable through a generic "update whatever fields
// // you send" request, or any user could set their own role to admin too.
// // Only ever allows the user -> dairyOwner transition.
// export const becomeDairyOwner = async (req, res) => {
//     try {
//         if (req.user.role === "dairyOwner") {
//             return res.status(200).json({
//                 success: true,
//                 message: "You're already a dairy owner",
//                 data: req.user,
//             });
//         }
//         if (req.user.role !== "user") {
//             return res.status(403).json({ success: false, message: "This account type can't become a dairy owner" });
//         }

//         const updatedUser = await User.findByIdAndUpdate(
//             req.user._id,
//             { role: "dairyOwner" },
//             { new: true, runValidators: true }
//         ).select('-password');

//         res.status(200).json({
//             success: true,
//             message: "You're now a dairy owner — register your dairy to get started",
//             data: updatedUser,
//         });
//     } catch (error) {
//         res.status(500).json({ success: false, message: "Error upgrading account", error: error.message });
//     }
// };

// // @desc    Upgrade the logged-in user's account to a delivery rider.
// //          No dairy is chosen here — matching happens dynamically per
// //          delivery, based on proximity (see deliveryController.js).
// // @route   PATCH /api/user/become-delivery-person
// // @access  Private
// // Deliberately narrow, same reasoning as becomeDairyOwner: only ever moves
// // 'user' -> 'deliveryPerson'. Known limitation: no approval step from any
// // dairy owner — anyone can become a rider and be matched to any nearby
// // delivery. Worth hardening with an invite/approval flow later.
// export const becomeDeliveryPerson = async (req, res) => {
//     try {
//         if (req.user.role === "deliveryPerson") {
//             return res.status(200).json({
//                 success: true,
//                 message: "You're already a delivery rider",
//                 data: req.user,
//             });
//         }
//         if (req.user.role !== "user") {
//             return res.status(403).json({ success: false, message: "This account type can't become a delivery rider" });
//         }

//         // No dairy is chosen here — riders aren't affiliated with one dairy.
//         // Which delivery they get is decided dynamically, per-delivery, by
//         // proximity at the moment a dairy owner creates it (see
//         // deliveryController.js's findNearestRider).
//         const updatedUser = await User.findByIdAndUpdate(
//             req.user._id,
//             { role: "deliveryPerson" },
//             { new: true, runValidators: true }
//         ).select('-password');

//         res.status(200).json({
//             success: true,
//             message: "You're now a delivery rider — deliveries near you will be offered automatically",
//             data: updatedUser,
//         });
//     } catch (error) {
//         res.status(500).json({ success: false, message: "Error upgrading account", error: error.message });
//     }
// };

// // @desc    List delivery riders near a dairy, closest first — for the
// //          manual "reassign" override in the owner dashboard. Riders
// //          aren't affiliated with a specific dairy, so this returns ALL
// //          registered riders who've shared a location, sorted by distance
// //          to this dairy (not filtered to "belongs to" this dairy, since
// //          that concept doesn't exist).
// // @route   GET /api/user/riders/:dairyId
// // @access  Private (dairy owner — only for their own dairy — or admin)
// export const getRidersForDairy = async (req, res) => {
//     try {
//         const { dairyId } = req.params;

//         if (req.user.role === "dairyOwner") {
//             const ownsDairy = await Dairy.findOne({ _id: dairyId, owner: req.user._id });
//             if (!ownsDairy) {
//                 return res.status(403).json({ success: false, message: "Not authorized for this dairy" });
//             }
//         }

//         const dairy = await Dairy.findById(dairyId);
//         const coordinates = dairy?.location?.coordinates;

//         let query = User.find({
//             role: "deliveryPerson",
//             currentLocation: { $exists: true, $ne: null },
//         }).select("username phone email");

//         if (coordinates) {
//             query = query.where("currentLocation").near({ center: { type: "Point", coordinates } });
//         }

//         const riders = await query;
//         res.status(200).json({ success: true, count: riders.length, data: riders });
//     } catch (error) {
//         res.status(500).json({ success: false, message: "Error fetching riders", error: error.message });
//     }
// };

// // @desc    Update the logged-in user's current location (used to find the
// //          nearest rider when auto-assigning a delivery)
// // @route   PATCH /api/user/location
// // @access  Private
// export const updateMyLocation = async (req, res) => {
//     try {
//         const { coordinates } = req.body; // [lng, lat]
//         if (!coordinates || coordinates.length !== 2) {
//             return res.status(400).json({ success: false, message: "Valid coordinates [lng, lat] required" });
//         }

//         const user = await User.findByIdAndUpdate(
//             req.user._id,
//             { currentLocation: { type: "Point", coordinates } },
//             { new: true }
//         ).select("-password");

//         res.status(200).json({ success: true, data: user });
//     } catch (error) {
//         res.status(500).json({ success: false, message: "Error updating location", error: error.message });
//     }
// };

// // @desc    Change password
// // @route   PATCH /api/auth/change-password
// // @access  Private
// export const changePassword = async (req, res) => {
//     try {
//         const { currentPassword, newPassword } = req.body;

//         if (!currentPassword || !newPassword) {
//             return res.status(400).json({ success: false, message: "Current and new password are required" });
//         }

//         const user = await User.findById(req.user._id).select('+password');

//         const isMatch = await bcrypt.compare(currentPassword, user.password);
//         if (!isMatch) {
//             return res.status(401).json({ success: false, message: "Current password is incorrect" });
//         }

//         user.password = await bcrypt.hash(newPassword, 10);
//         await user.save();

//         res.status(200).json({ success: true, message: "Password changed successfully" });

//     } catch (error) {
//         res.status(500).json({ success: false, message: "Error changing password", error: error.message });
//     }
// };


// // @desc    Forgot password - sends reset email
// // @route   POST /api/auth/forgot-password
// // @access  Public
// export const forgotPassword = async (req, res) => {
//     try {
//         const { email } = req.body;

//         if (!email) {
//             return res.status(400).json({ success: false, message: "Email is required" });
//         }

//         const user = await User.findOne({ email });
//         if (!user) {
//             // Don't reveal if email exists or not (security best practice)
//             return res.status(200).json({ success: true, message: "If this email exists, a reset link has been sent" });
//         }

//         // Generate reset token
//         const resetToken = crypto.randomBytes(32).toString("hex");

//         // Hash it before saving to DB
//         const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

//         // Save to user
//         user.resetPasswordToken = hashedToken;
//         user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes
//         await user.save();

//         // Send email with raw (unhashed) token
//         const resetURL = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

//         await sendEmail({
//             to: user.email,
//             subject: "Password Reset Request",
//             html: `
//                 <h2>Password Reset</h2>
//                 <p>You requested to reset your password. Click the link below:</p>
//                 <a href="${resetURL}" style="
//                     background:#4F46E5;
//                     color:white;
//                     padding:10px 20px;
//                     text-decoration:none;
//                     border-radius:5px;
//                 ">Reset Password</a>
//                 <p>This link expires in <strong>15 minutes</strong>.</p>
//                 <p>If you didn't request this, please ignore this email.</p>
//             `
//         });

//         res.status(200).json({ success: true, message: "Password reset link sent to your email" });

//     } catch (error) {
//         // Clean up token if email fails
//         await User.findOneAndUpdate(
//             { email: req.body.email },
//             { resetPasswordToken: undefined, resetPasswordExpire: undefined }
//         );
//         res.status(500).json({ success: false, message: "Error sending email", error: error.message });
//     }
// };

// // @desc    Reset password using token
// // @route   POST /api/auth/reset-password/:token
// // @access  Public
// export const resetPassword = async (req, res) => {
//     try {
//         const { token } = req.params;
//         const { newPassword } = req.body;

//         if (!newPassword) {
//             return res.status(400).json({ success: false, message: "New password is required" });
//         }

//         // Hash the incoming token to compare with DB
//         const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

//         // Find user with valid (non-expired) token
//         const user = await User.findOne({
//             resetPasswordToken: hashedToken,
//             resetPasswordExpire: { $gt: Date.now() }  // not expired
//         });

//         if (!user) {
//             return res.status(400).json({ success: false, message: "Invalid or expired reset token" });
//         }

//         // Set new password
//         user.password = await bcrypt.hash(newPassword, 10);

//         // Clear reset token fields
//         user.resetPasswordToken = undefined;
//         user.resetPasswordExpire = undefined;

//         await user.save();

//         res.status(200).json({ success: true, message: "Password reset successfully. You can now login." });

//     } catch (error) {
//         res.status(500).json({ success: false, message: "Error resetting password", error: error.message });
//     }
// };


// // @desc    Deactivate account
// // @route   PATCH /api/auth/deactivate
// // @access  Private
// export const deactivateAccount = async (req, res) => {
//     try {
//         await User.findByIdAndUpdate(req.user._id, { isActive: false });
//         res.status(200).json({ success: true, message: "Account deactivated successfully" });
//     } catch (error) {
//         res.status(500).json({ success: false, message: "Error deactivating account", error: error.message });
//     }
// };

// export const reactivateAccount = async(req, res) => {
//     try {
//         const { email, password } = req.body;
//         if(!email || !password){
//             return res.status(400).json({ success: false, message: "Email and password are required" });
//         }

//         const user = await User.findOne({email}).select('+password');

//         if(!user){
//             return res.status(404).json({ success: false, message: "User not found" });
//         }
//         if(user.isActive){
//             return res.status(400).json({ success: false, message: "Account is already active" });
//         }
//         const isMatch = await bcrypt.compare(password, user.password);
//         if(!isMatch){
//             return res.status(401).json({ success: false, message: "Invalid email or password" });
//         }
//         await User.findByIdAndUpdate(user._id, {isActive: true});
//         res.status(200).json({ success: true, message: "Account reactivated successfully" });
//     } catch (error) {
//         res.status(500).json({ success: false, message: "Error reactivating account", error: error.message });
//     }
// }

// // @desc    Add a new address
// // @route   POST /api/auth/address
// // @access  Private
// export const userAddress = async (req, res) => {
//     try {
//         const { label, fullAddress, location } = req.body;

//         if (!fullAddress || !location?.coordinates) {
//             return res.status(400).json({ success: false, message: "fullAddress and location.coordinates are required" });
//         }

//         const address = await Address.create({
//             user: req.user._id,        
//             label,
//             fullAddress,
//             location: {
//                 type: "Point",
//                 coordinates: location.coordinates
//             }
//         });

//         res.status(201).json({ success: true, message: "Address added successfully", data: address });

//     } catch (error) {
//         res.status(500).json({ success: false, message: "Error adding address", error: error.message });
//     }
// };

// // @desc    Get all addresses of logged in user
// // @route   GET /api/auth/address
// // @access  Private
// export const getUserAddresses = async (req, res) => {
//     try {
//         const addresses = await Address.find({ user: req.user._id });
//         res.status(200).json({ success: true, count: addresses.length, data: addresses });
//     } catch (error) {
//         res.status(500).json({ success: false, message: "Error fetching addresses", error: error.message });
//     }
// };

// // @desc    Delete an address
// // @route   DELETE /api/auth/address/:id
// // @access  Private
// export const deleteAddress = async (req, res) => {
//     try {
//         const address = await Address.findById(req.params.id);

//         if (!address) {
//             return res.status(404).json({ success: false, message: "Address not found" });
//         }

//         if (address.user.toString() !== req.user._id.toString()) {
//             return res.status(403).json({ success: false, message: "Not authorized to delete this address" });
//         }

//         await address.deleteOne();
//         res.status(200).json({ success: true, message: "Address deleted successfully" });

//     } catch (error) {
//         res.status(500).json({ success: false, message: "Error deleting address", error: error.message });
//     }
// };
















// import Address from "../models/Address.js";
// import User from "../models/user.js";
// import bcrypt from "bcryptjs";

// export const userRegister = async (req, res) => {
//     try{

//         const { username, email, password, profilePicture, phone, location, favorites, orders, role,
//              isActive, preferredMilk, isVerified } = req.body


//         if (!username?.firstName || !email || !password || !phone || !location?.coordinates || !location?.address) {
//             return res.status(400).json({ message: "Missing required fields" });
//         }

//         const existingUser = await User.findOne({email})
//         if(existingUser){
//             return res.status(400).json({message: "Email already exists. Please use a different email."})
//         }

//         // Hash the password
//         const hashedPassword = await bcrypt.hash(password, 10);

//         // Replace the plain text password with the hashed one
//         req.body.password = hashedPassword;


//         const newUser = await User.create({
//             username, email, password, profilePicture, phone, location, favorites, orders, role,
//              isActive, preferredMilk, isVerified
//         })
//         res.status(201).json({message: "User registered successfully", user: newUser})
//     } catch (error) {
//         res.status(500).json({message: "Error registering user", error: error.message})
//     }
// }

// export const userAddress = async(req, res) => {
//     try{
//         const { user, label, fullAddress, location } = req.body;

//         if(!user || !fullAddress || !location?.coordinates){
//             return res.status(400).json({message: "user, fullAddress and location.coordinates are required"})
//         }

//         const address = await Address.create({
//             user,
//             label,
//             fullAddress,
//             location: {
//                 type: "Point",
//                 coordinates: location.coordinates
//             }
//         })
//         res.status(201).json({message: "Address added successfully",
//             address
//         })
//     }
//     catch(error){
//         console.error("Error adding address", error);
//         res.status(500).json({
//             message: "Error adding address",
//             error: error.message
//         })
//     }
// }






import Address from "../models/Address.js";
import User from "../models/user.js";
import Dairy from "../models/dairy.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js";

// ─── Helper: Generate JWT Token ───────────────────────────────────
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET);
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const userRegister = async (req, res) => {
    try {
        const {
            username, email, password, profilePicture,
            phone, location, favorites, role, preferredMilk
        } = req.body;

        // Validate required fields
        if (!username?.firstName || !email || !password || !phone || !location?.coordinates || !location?.address) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "Email already exists. Please use a different email." });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
            profilePicture,
            phone,
            location,
            favorites,
            role,
            preferredMilk
        });

        // Generate token
        const token = generateToken(newUser._id);


        // Return user without password
        const userResponse = newUser.toObject();
        delete userResponse.password;

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            token,
            user: userResponse
        });

    } catch (error) {
        res.status(500).json({ success: false, message: "Error registering user", error: error.message });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const userLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and password are required" });
        }

        // Find user and include password for comparison
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        // Check if account is active
        if (!user.isActive) {
            return res.status(403).json({ success: false, message: "Your account has been deactivated. Please contact support." });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        // Generate token
        const token = generateToken(user._id);

        // Return user without password
        const userResponse = user.toObject();
        delete userResponse.password;

        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: userResponse
        });

    } catch (error) {
        res.status(500).json({ success: false, message: "Error logging in", error: error.message });
    }
};

// @desc    Get logged in user profile
// @route   GET /api/auth/profile
// @access  Private
export const getProfile = async (req, res) => {
    try {
        if(!req.user || !req.user._id){
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        const user = await User.findById(req.user._id)
            .select('-password')
            .populate('orders');

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({ success: true, data: user });

    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching profile", error: error.message });
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
    try {
        const { username, email, phone, profilePicture, location, favorites, preferredMilk } = req.body;

        // Prevent updating sensitive fields
        const updates = {};
        if (username) updates.username = username;
        if (email) updates.email = email;
        if (phone) updates.phone = phone;
        if (profilePicture) updates.profilePicture = profilePicture;
        if (location) updates.location = location;
        if (favorites) updates.favorites = favorites;
        if (preferredMilk) updates.preferredMilk = preferredMilk;

        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            updates,
            { new: true, runValidators: true }
        ).select('-password');

        res.status(200).json({ success: true, message: "Profile updated successfully", data: updatedUser });

    } catch (error) {
        res.status(500).json({ success: false, message: "Error updating profile", error: error.message });
    }
};

// @desc    Upgrade the current account to a dairy owner
// @route   PATCH /api/user/become-dairy-owner
// @access  Private
// This is its OWN endpoint rather than an updateProfile field on purpose —
// role must never be settable through a generic "update whatever fields
// you send" request, or any user could set their own role to admin too.
// Only ever allows the user -> dairyOwner transition.
export const becomeDairyOwner = async (req, res) => {
    try {
        if (req.user.role === "dairyOwner") {
            return res.status(200).json({
                success: true,
                message: "You're already a dairy owner",
                data: req.user,
            });
        }
        if (req.user.role !== "user") {
            return res.status(403).json({ success: false, message: "This account type can't become a dairy owner" });
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            { role: "dairyOwner" },
            { new: true, runValidators: true }
        ).select('-password');

        res.status(200).json({
            success: true,
            message: "You're now a dairy owner — register your dairy to get started",
            data: updatedUser,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error upgrading account", error: error.message });
    }
};

// @desc    Upgrade the logged-in user's account to a delivery rider.
//          No dairy is chosen here — matching happens dynamically per
//          delivery, based on proximity (see deliveryController.js).
// @route   PATCH /api/user/become-delivery-person
// @access  Private
// Deliberately narrow, same reasoning as becomeDairyOwner: only ever moves
// 'user' -> 'deliveryPerson'. Known limitation: no approval step from any
// dairy owner — anyone can become a rider and be matched to any nearby
// delivery. Worth hardening with an invite/approval flow later.
export const becomeDeliveryPerson = async (req, res) => {
    try {
        if (req.user.role === "deliveryPerson") {
            return res.status(200).json({
                success: true,
                message: "You're already a delivery rider",
                data: req.user,
            });
        }
        if (req.user.role !== "user") {
            return res.status(403).json({ success: false, message: "This account type can't become a delivery rider" });
        }

        // No dairy is chosen here — riders aren't affiliated with one dairy.
        // Which delivery they get is decided dynamically, per-delivery, by
        // proximity at the moment a dairy owner creates it (see
        // deliveryController.js's findNearestRider).
        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            { role: "deliveryPerson" },
            { new: true, runValidators: true }
        ).select('-password');

        res.status(200).json({
            success: true,
            message: "You're now a delivery rider — deliveries near you will be offered automatically",
            data: updatedUser,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error upgrading account", error: error.message });
    }
};

// @desc    List delivery riders near a dairy, closest first — for the
//          manual "reassign" override in the owner dashboard. Riders
//          aren't affiliated with a specific dairy, so this returns ALL
//          registered riders who've shared a location, sorted by distance
//          to this dairy (not filtered to "belongs to" this dairy, since
//          that concept doesn't exist).
// @route   GET /api/user/riders/:dairyId
// @access  Private (dairy owner — only for their own dairy — or admin)
export const getRidersForDairy = async (req, res) => {
    try {
        const { dairyId } = req.params;

        if (req.user.role === "dairyOwner") {
            const ownsDairy = await Dairy.findOne({ _id: dairyId, owner: req.user._id });
            if (!ownsDairy) {
                return res.status(403).json({ success: false, message: "Not authorized for this dairy" });
            }
        }

        const dairy = await Dairy.findById(dairyId);
        const coordinates = dairy?.location?.coordinates;

        let query = User.find({
            role: "deliveryPerson",
            riderStatus: "approved",
            // currentLocation: { $exists: true, $ne: null },
        }).select("username phone email");

        if (coordinates) {
            query = query.where("currentLocation").near({ center: { type: "Point", coordinates } });
        }

        const riders = await query;
        res.status(200).json({ success: true, count: riders.length, data: riders });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching riders", error: error.message });
    }
};

// @desc    List riders awaiting approval — any dairy owner (or admin) can
//          approve/reject, since riders have no fixed dairy affiliation.
// @route   GET /api/user/riders/pending
// @access  Private (dairyOwner or admin)
export const getPendingRiders = async (req, res) => {
    try {
        const riders = await User.find({ role: "deliveryPerson", riderStatus: "pending" })
            .select("username phone email createdAt");
        res.status(200).json({ success: true, count: riders.length, data: riders });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching pending riders", error: error.message });
    }
};

// @desc    Approve a pending rider — makes them eligible for matching
// @route   PATCH /api/user/riders/:riderId/approve
// @access  Private (dairyOwner or admin)
export const approveRider = async (req, res) => {
    try {
        const rider = await User.findOneAndUpdate(
            { _id: req.params.riderId, role: "deliveryPerson" },
            { riderStatus: "approved" },
            { new: true }
        ).select("-password");
        if (!rider) return res.status(404).json({ success: false, message: "Rider not found" });
        res.status(200).json({ success: true, message: "Rider approved", data: rider });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error approving rider", error: error.message });
    }
};

// @desc    Reject a pending rider — they stay excluded from matching
// @route   PATCH /api/user/riders/:riderId/reject
// @access  Private (dairyOwner or admin)
export const rejectRider = async (req, res) => {
    try {
        const rider = await User.findOneAndUpdate(
            { _id: req.params.riderId, role: "deliveryPerson" },
            { riderStatus: "rejected" },
            { new: true }
        ).select("-password");
        if (!rider) return res.status(404).json({ success: false, message: "Rider not found" });
        res.status(200).json({ success: true, message: "Rider rejected", data: rider });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error rejecting rider", error: error.message });
    }
};

// @desc    Update the logged-in user's current location (used to find the
//          nearest rider when auto-assigning a delivery)
// @route   PATCH /api/user/location
// @access  Private
export const updateMyLocation = async (req, res) => {
    try {
        const { coordinates } = req.body; // [lng, lat]
        if (!coordinates || coordinates.length !== 2) {
            return res.status(400).json({ success: false, message: "Valid coordinates [lng, lat] required" });
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { currentLocation: { type: "Point", coordinates } },
            { new: true }
        ).select("-password");

        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error updating location", error: error.message });
    }
};

// @desc    Change password
// @route   PATCH /api/auth/change-password
// @access  Private
export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, message: "Current and new password are required" });
        }

        const user = await User.findById(req.user._id).select('+password');

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Current password is incorrect" });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.status(200).json({ success: true, message: "Password changed successfully" });

    } catch (error) {
        res.status(500).json({ success: false, message: "Error changing password", error: error.message });
    }
};


// @desc    Forgot password - sends reset email
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: "Email is required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            // Don't reveal if email exists or not (security best practice)
            return res.status(200).json({ success: true, message: "If this email exists, a reset link has been sent" });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString("hex");

        // Hash it before saving to DB
        const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

        // Save to user
        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes
        await user.save();

        // Send email with raw (unhashed) token
        const resetURL = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

        await sendEmail({
            to: user.email,
            subject: "Password Reset Request",
            html: `
                <h2>Password Reset</h2>
                <p>You requested to reset your password. Click the link below:</p>
                <a href="${resetURL}" style="
                    background:#4F46E5;
                    color:white;
                    padding:10px 20px;
                    text-decoration:none;
                    border-radius:5px;
                ">Reset Password</a>
                <p>This link expires in <strong>15 minutes</strong>.</p>
                <p>If you didn't request this, please ignore this email.</p>
            `
        });

        res.status(200).json({ success: true, message: "Password reset link sent to your email" });

    } catch (error) {
        // Clean up token if email fails
        await User.findOneAndUpdate(
            { email: req.body.email },
            { resetPasswordToken: undefined, resetPasswordExpire: undefined }
        );
        res.status(500).json({ success: false, message: "Error sending email", error: error.message });
    }
};

// @desc    Reset password using token
// @route   POST /api/auth/reset-password/:token
// @access  Public
export const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { newPassword } = req.body;

        if (!newPassword) {
            return res.status(400).json({ success: false, message: "New password is required" });
        }

        // Hash the incoming token to compare with DB
        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

        // Find user with valid (non-expired) token
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() }  // not expired
        });

        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid or expired reset token" });
        }

        // Set new password
        user.password = await bcrypt.hash(newPassword, 10);

        // Clear reset token fields
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        res.status(200).json({ success: true, message: "Password reset successfully. You can now login." });

    } catch (error) {
        res.status(500).json({ success: false, message: "Error resetting password", error: error.message });
    }
};


// @desc    Deactivate account
// @route   PATCH /api/auth/deactivate
// @access  Private
export const deactivateAccount = async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.user._id, { isActive: false });
        res.status(200).json({ success: true, message: "Account deactivated successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error deactivating account", error: error.message });
    }
};

export const reactivateAccount = async(req, res) => {
    try {
        const { email, password } = req.body;
        if(!email || !password){
            return res.status(400).json({ success: false, message: "Email and password are required" });
        }

        const user = await User.findOne({email}).select('+password');

        if(!user){
            return res.status(404).json({ success: false, message: "User not found" });
        }
        if(user.isActive){
            return res.status(400).json({ success: false, message: "Account is already active" });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }
        await User.findByIdAndUpdate(user._id, {isActive: true});
        res.status(200).json({ success: true, message: "Account reactivated successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error reactivating account", error: error.message });
    }
}

// @desc    Add a new address
// @route   POST /api/auth/address
// @access  Private
export const userAddress = async (req, res) => {
    try {
        const { label, fullAddress, location } = req.body;

        if (!fullAddress || !location?.coordinates) {
            return res.status(400).json({ success: false, message: "fullAddress and location.coordinates are required" });
        }

        const address = await Address.create({
            user: req.user._id,        
            label,
            fullAddress,
            location: {
                type: "Point",
                coordinates: location.coordinates
            }
        });

        res.status(201).json({ success: true, message: "Address added successfully", data: address });

    } catch (error) {
        res.status(500).json({ success: false, message: "Error adding address", error: error.message });
    }
};

// @desc    Get all addresses of logged in user
// @route   GET /api/auth/address
// @access  Private
export const getUserAddresses = async (req, res) => {
    try {
        const addresses = await Address.find({ user: req.user._id });
        res.status(200).json({ success: true, count: addresses.length, data: addresses });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching addresses", error: error.message });
    }
};

// @desc    Delete an address
// @route   DELETE /api/auth/address/:id
// @access  Private
export const deleteAddress = async (req, res) => {
    try {
        const address = await Address.findById(req.params.id);

        if (!address) {
            return res.status(404).json({ success: false, message: "Address not found" });
        }

        if (address.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "Not authorized to delete this address" });
        }

        await address.deleteOne();
        res.status(200).json({ success: true, message: "Address deleted successfully" });

    } catch (error) {
        res.status(500).json({ success: false, message: "Error deleting address", error: error.message });
    }
};