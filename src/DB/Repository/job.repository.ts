import { Model } from 'mongoose';
import { DataBaseRepository } from './database.repository';
import { JobDocument as TDocument, Job } from '../Model';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JobRepository extends DataBaseRepository<Job> {
    constructor(
    @InjectModel(Job.name)
    protected override readonly model: Model<TDocument>,
) {
    super(model);
    }
}
