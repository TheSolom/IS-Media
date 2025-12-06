import connection from '../configs/database.js';
import BaseModel from './baseModel.js';

export default class OTPModel extends BaseModel {
    constructor() {
        super('otp');
    }
}