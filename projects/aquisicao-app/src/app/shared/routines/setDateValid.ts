import * as moment from "moment";

// função recusiva que trata os campos de data de form para serem carregados de maneira correta na exibição
export function setDateValid(resource: { [key: string]: any }) {
    Object.keys(resource).forEach((key) => {
        if (Array.isArray(resource[key])) {
            resource[key].forEach((element: any) => {
                setDateValid(element);
            });
        }
        if (typeof resource[key] == "object" && resource[key]) {
            setDateValid(resource[key]);
        }
        const formatoData =
            /^((\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}).(\d{3})Z)$/;
        if (formatoData.test(resource[key])) {
            // if (moment(resource[key], "YYYY-MM-DDTHH:mm:ss.SSSZ", true).isValid()) {
            if (
                key.includes("Hora") ||
                key == "InseridoEm" ||
                key == "ModificadoEm"
            )
                resource[key] = moment.utc(resource[key]).format("YYYY-MM-DDTHH:mm");
            else resource[key] = moment.utc(resource[key]).format("YYYY-MM-DD");
        }
    });
    return resource;
}