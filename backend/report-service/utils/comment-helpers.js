// Construye la respuesta normalizada de un comentario (DTO de salida)
export const buildCommentResponse = (comment) => ({
    id: comment.Id,
    content: comment.Content,
    isInternal: comment.IsInternal,
    createdAt: comment.CreatedAt,
    author: comment.Author
    ? {
        id: comment.Author.Id,
        name: comment.Author.Name,
        surname: comment.Author.Surname,
        username: comment.Author.Username,
        }
    : null,
});

// Construye la respuesta normalizada de una notificación (DTO de salida)
// El campo report solo se incluye si el include está cargado en la query.
export const buildNotificationResponse = (notification) => ({
    id: notification.Id,
    type: notification.Type,
    message: notification.Message,
    isRead: notification.IsRead,
    createdAt: notification.CreatedAt,
    report: notification.Report
    ? {
        id: notification.Report.Id,
        title: notification.Report.Title,
        }
    : null,
});
