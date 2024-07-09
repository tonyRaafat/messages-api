import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken';
import sendEmail from '../../utils/email.js';
import validateOtpRequest from "../../utils/validateOtpRequest.js"
import validateUser from '../../utils/validateUser.js'
import { UserOtpVerification } from '../../../database/models/otp.model.js';
import { User } from '../../../database/models/users.model.js';
import { throwError } from '../../utils/throwerror.js';

export const register = async (req, res,next) => {
    try {
        const { error } = validateUser(req.body);
        if (error) throw throwError(error,400);

        let user = await User.findOne({ email: req.body.email });
        if (user) {
            if (!user.verified) {
                throw throwError("User already registered, you need to verifiy user",400)
            }
            throw throwError('User already registered.',400)
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        user = new User({
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword,
            verified: false
        });
        await user.save()
        await sendVerificationEmail(user)
        res.send({ id: user._id, username: user.username, email: user.email });
    } catch (error) {
        next(error)
    }
}

export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) throw throwError('Invalid email or password.',400)

        if (!user.verified) throw throwError('User needs to be verified',400)

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) throw throwError('Invalid email or password.',400);

        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
        res.send({ token });
    } catch (error) {
        next(error)
    }
}

export const verifyOtp = async (req, res, next) => {
    try {
        const { error } = validateOtpRequest(req.body);
        if (error) throw throwError(error,400)
        const { userId, otpCode } = req.body;
        const otps = await UserOtpVerification.find({ userId })
        
        if (otps.length < 0) throw throwError("no otp found for this userId",400)

        const { expiaryDate } = otps[0]
        const hashedOtp = otps[0].otp
        if (expiaryDate < Date.now()) {
            await UserOtpVerification.deleteMany({ userId })
            throw throwError("OTP is expired make anthor request for it" ,400)
        } else {
            const validOtp = bcrypt.compare(otpCode, hashedOtp)
            if (!validOtp) {
                throw throwError("wrong OTP!",400)
            } else {
                await User.updateOne({ _id: userId }, { verified: true })
                await UserOtpVerification.deleteMany({ userId })
                return res.status(200).json({ msg: "user is now verfied" });
            }
        }
    } catch (error) {
        next(error)
    }
}

export const requestOtp = async (req, res, next) => {
    try {
        const { userId, email } = req.body;
        await UserOtpVerification.deleteMany({userId})
        await sendVerificationEmail({_id:userId,email})
        res.json({msg:"OTP code is send check your inbox"})
    } catch (error) {
        next(error)
    }
}

async function sendVerificationEmail(user) {
    try {
        const otp = `${Math.floor(10000 + Math.random() * 90000)}`
        const otpSalt = await bcrypt.genSalt(10);
        const hashedOtp = await bcrypt.hash(otp, otpSalt);
        console.log(otp)
        await sendEmail(user.email, 'otp verification', { text: `Your OTP is: ${otp}` })

        const otpVerification = new UserOtpVerification({
            userId: user._id,
            otp: hashedOtp,
            createdDate: Date.now(),
            expiaryDate: Date.now() + 60 * 5 * 1000
        })
        await otpVerification.save()

    } catch (error) {
        throw throwError(error)
    }
}