import {Schema, model} from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUser {
    username: string;
    email: string;
    password: string;
    role: 'admin'| 'user';
    firstName?: string;
    lastName?: string;
    socialLinks?: {
        website?: string;
        facebook?: string;
        instagram?: string;
        linkedin?: string;
        x?: string;
        youtube?: string;
    }
}

const userSchema = new Schema<IUser>(
    {
        username: {
            type: String,
            required: [true, 'Username is required'],
            maslength: [20, 'Username cannot exceed 20 characters'],
            unique: [true, 'Username must be unique'],
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            maxlength: [50, 'Email cannot exceed 50 characters'],
            unique: [true, 'Email must be unique'],
        },
        password: {
            type: String,
            required: [true, 'password is required'],
            select: false,
        },
        role: {
            type: String,
            required: [true, 'Role is required'],
            enum: {
                values: ['admin', 'user'],
                message: '${VALUE} is not supported',
            },
            default: 'user',
        },
        firstName: {
            type: String,
            maxlength: [20, 'First name cannot exceed 20 characters'],
        },
        lastName: {
            type: String,
            maxlength: [20, 'Last name cannot exceed 20 characters'],
        },
        socialLinks: {
            website: {
                type: String,
                maxLength: [100, 'Website address must less than 100 characters'],
            },
            facebook: {
                type: String,
                maxLength: [100, 'Facebook profile url must less than 100 characters'],
            },
            instagram: {
                type: String,
                maxLength: [100, 'Instagram profile url must less than 100 characters'],
            },
            linkedin: {
                type: String,
                maxLength: [100, 'Linkedin profile url must less than 100 characters'],
            },
            x: {
                type: String,
                maxLength: [100, 'X profile url must less than 100 characters'],
            },
            youtube: {
                type: String,
                maxLength: [100, 'YouTube profile url must less than 100 characters'],
            },
        }
    },
    {
        timestamps: true,
    }
)

userSchema.pre('save', async function(next) {
    if(!this.isModified('password')) {
        next();
        return;
    }
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

export default model<IUser>('User', userSchema);