import { Response, Request } from "express"
import bcrypt from 'bcrypt'
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken'
import { mongoUser } from "../app";
import { secretkey } from "../app";
import { UserModel } from "../models/user";


export const AuthController: any = {


    logIn: async (req: Request, res: Response) => {
        ///
        const { username, password } = req.body;
        const user: any = await UserModel.findOne({ username: username })
        if (!user) {
            return res.status(401).json({ message: 'User not found' })
        }
        bcrypt.compare(user.password, password, (error, result) => {
            if (result !== undefined) {
                const token =
                    jwt.sign({ userId: user.id, username: user.username }
                        , secretkey,{expiresIn:'1h'})
                return res.status(200).json({ token:token ,user_id:user.id });
            } else {
                return res.status(401).json({ message: 'Invalid username or password' })
            }
        })
    }
    ,
    Register: async (req: Request, res: Response) => {
        const { username, password, email } = req.body;
        //impl here validation 
        const hashedPassword = bcrypt.hashSync(password, 13)
        const newUser = new UserModel({
            id: uuidv4(),
            username: username,
            email: email,
            password: hashedPassword,
        })

        await newUser.save().then((response) => {
            res.status(200).send({ message: 'success' })
        }).catch((err) => {
            res.status(500).send({ message: err })
        })
    },

    addUserFlight: async (req: Request, res: Response) => {
        const { flight } = req.body
        await mongoUser.db('countries').collection('userFlights').insertOne(flight).then(() => {
            res.status(200).send({ message: 'success' })
        }).catch((err) => {
            res.status(500).send({ message: err })
        })

    },
    findUserFlightById: async (req: Request, res: Response) => {
        const { user_id } = req.body
        await mongoUser.db('countries').collection('userFlights').find({ user_id: user_id }).toArray().then((response) => {
            res.status(200).send(response)
        }).catch((err) => {
            res.status(500).send({ message: err })
        })

    },



    addGoogleAccount: async (req: Request, res: Response, user: any) => {
        const { id, username, email, password } = req.params


    }
}