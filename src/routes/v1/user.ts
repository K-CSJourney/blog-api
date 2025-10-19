import { Router} from "express";
import {param, query, body} from 'express-validator';
import authenticate from "@/middlewares/authenticate";
import validationError from "@/middlewares/validationError";
import User from '@/modules/user';

const router = Router();

export default router;