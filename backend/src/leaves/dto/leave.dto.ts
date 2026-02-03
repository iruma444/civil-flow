import { IsEnum, IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateLeaveDto {
    @IsEnum(['PAID', 'UNPAID', 'SICK', 'SPECIAL', 'COMPENSATORY'])
    leaveType!: 'PAID' | 'UNPAID' | 'SICK' | 'SPECIAL' | 'COMPENSATORY';

    @IsDateString()
    startDate!: string;

    @IsDateString()
    endDate!: string;

    @IsOptional()
    @IsString()
    reason?: string;
}

export class UpdateLeaveStatusDto {
    @IsEnum(['APPROVED', 'REJECTED'])
    status!: 'APPROVED' | 'REJECTED';
}
