import { Model } from 'mongoose';
import { DataBaseRepository } from './database.repository';
import { CompanyDocument as TDocument, Company } from '../Model';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CompanyRepository extends DataBaseRepository<Company> {
    constructor(
    @InjectModel(Company.name)
    protected override readonly model: Model<TDocument>,
) {
    super(model);
    }
}
