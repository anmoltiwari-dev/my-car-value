import { IsString, IsNumber, Min, Max, IsLatitude, IsLongitude } from "class-validator";

export class CreateReportDto {

    @IsString()
    make: string;

    @IsString()
    model: string;

    @IsNumber()
    @Min(1930)
    @Max(2050)
    year: number;

    @IsNumber()
    @Min(0)
    @Max(1000000)
    mileage: number;
    
    @IsLongitude()
    lng: number;

    @IsLatitude()
    lat: number;

    @IsNumber()
    @Max(1000000)
    @Min(0)
    price: number;
}