import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CentroCustoService } from './centro-custo.service';
import { CreateCentroCustoDto } from './dto/create-centro-custo.dto';
import { UpdateCentroCustoDto } from './dto/update-centro-custo.dto';

@Controller('centros-custo')
export class CentroCustoController {
  constructor(private readonly centroCustoService: CentroCustoService) {}

  @Post()
  create(@Body() createCentroCustoDto: CreateCentroCustoDto) {
    return this.centroCustoService.create(createCentroCustoDto);
  }

  @Get()
  findAll() {
    return this.centroCustoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.centroCustoService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCentroCustoDto: UpdateCentroCustoDto,
  ) {
    return this.centroCustoService.update(id, updateCentroCustoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.centroCustoService.remove(id);
  }
}





