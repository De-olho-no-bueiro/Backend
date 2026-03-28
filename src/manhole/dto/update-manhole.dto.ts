import { PartialType } from '@nestjs/swagger';
import { CreateManholeDto } from './create-manhole.dto';

export class UpdateManholeDto extends PartialType(CreateManholeDto) {}
