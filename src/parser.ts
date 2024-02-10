export function cleanMunipolis(text: string) {
    text = text.split("-\n\nNastavení upozornění")[0];
    text = text.split("Nezobrazuje se Vám E-mail správně?")[1];
    return text;
}