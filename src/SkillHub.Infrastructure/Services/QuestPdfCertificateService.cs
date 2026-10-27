using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using SkillHub.Application.DTOs;
using SkillHub.Application.Interfaces;

namespace SkillHub.Infrastructure.Services;

public class QuestPdfCertificateService : IPdfCertificateService
{
    public QuestPdfCertificateService()
    {
        QuestPDF.Settings.License = LicenseType.Community;
    }

    public byte[] GenerateCertificate(CertificateDataDto data)
    {
        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4.Landscape());
                page.Margin(40);
                page.PageColor(Colors.White);
                page.DefaultTextStyle(x => x.FontSize(12).FontColor(Colors.Grey.Darken3));

                // Border frame decoration
                page.Header().Column(col =>
                {
                    col.Item().Row(row =>
                    {
                        row.RelativeItem().Column(titleCol =>
                        {
                            titleCol.Item().Text(data.InstitutionName)
                                .FontSize(26)
                                .Bold()
                                .FontColor(Colors.Indigo.Darken2);

                            titleCol.Item().Text("Centro de Formación y Talleres Prácticos")
                                .FontSize(11)
                                .FontColor(Colors.Grey.Medium);
                        });

                        row.ConstantItem(150).AlignRight().Column(metaCol =>
                        {
                            metaCol.Item().Text($"Código: {data.WorkshopCode}")
                                .FontSize(12)
                                .Bold()
                                .FontColor(Colors.Indigo.Darken1);
                        });
                    });

                    col.Item().PaddingTop(15).LineHorizontal(2).LineColor(Colors.Indigo.Lighten2);
                });

                page.Content().PaddingVertical(30).Column(col =>
                {
                    col.Item().AlignCenter().Text(data.DocumentTitle.ToUpper())
                        .FontSize(24)
                        .ExtraBold()
                        .FontColor(Colors.Indigo.Darken3);

                    col.Item().PaddingTop(10).AlignCenter().Text("Se hace constar que:")
                        .FontSize(14)
                        .Italic()
                        .FontColor(Colors.Grey.Darken1);

                    col.Item().PaddingTop(15).AlignCenter().Text(data.ParticipantName)
                        .FontSize(22)
                        .Bold()
                        .FontColor(Colors.Indigo.Darken4);

                    col.Item().AlignCenter().Text($"Correo electrónico: {data.ParticipantEmail}")
                        .FontSize(11)
                        .FontColor(Colors.Grey.Medium);

                    col.Item().PaddingTop(20).AlignCenter()
                        .Text($"Se encuentra formalmente inscrito(a) en el taller:")
                        .FontSize(14);

                    col.Item().PaddingTop(10).AlignCenter().Text($"\"{data.WorkshopTitle}\"")
                        .FontSize(18)
                        .Bold()
                        .FontColor(Colors.Indigo.Darken2);

                    col.Item().PaddingTop(20).Background(Colors.Grey.Lighten4).Padding(15).Row(row =>
                    {
                        row.RelativeItem().Column(c =>
                        {
                            c.Item().Text("Instructor:").Bold().FontSize(11);
                            c.Item().Text(data.InstructorName).FontSize(12);
                        });

                        row.RelativeItem().Column(c =>
                        {
                            c.Item().Text("Fecha y Hora de Inicio:").Bold().FontSize(11);
                            c.Item().Text(data.StartDateTime.ToString("dd/MM/yyyy HH:mm")).FontSize(12);
                        });

                        row.RelativeItem().Column(c =>
                        {
                            c.Item().Text("Fecha y Hora de Fin:").Bold().FontSize(11);
                            c.Item().Text(data.EndDateTime.ToString("dd/MM/yyyy HH:mm")).FontSize(12);
                        });

                        row.RelativeItem().Column(c =>
                        {
                            c.Item().Text("Fecha de Inscripción:").Bold().FontSize(11);
                            c.Item().Text(data.EnrolledAt.ToString("dd/MM/yyyy HH:mm")).FontSize(12);
                        });
                    });
                });

                page.Footer().Column(col =>
                {
                    col.Item().LineHorizontal(1).LineColor(Colors.Grey.Lighten2);
                    col.Item().PaddingTop(10).Row(row =>
                    {
                        row.RelativeItem().Text($"Documento generado oficialmente por SkillHub el {data.GeneratedAt:dd/MM/yyyy HH:mm:ss} UTC")
                            .FontSize(9)
                            .FontColor(Colors.Grey.Medium);

                        row.ConstantItem(150).AlignRight().Text("Válido sin enmiendas")
                            .FontSize(9)
                            .FontColor(Colors.Grey.Medium);
                    });
                });
            });
        });

        return document.GeneratePdf();
    }
}
