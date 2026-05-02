import { User } from '../users/user-ref.model.js';

import { Report } from './report.model.js';
import { ReportComment } from './report-comment.model.js';
import { ReportFollower } from './report-follower.model.js';
import { ReportNotification } from './report-notification.model.js';
import { ReportStatusHistory } from './report-status-history.model.js';

// Asociaciones Report ↔ User
Report.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'Citizen',
});

Report.belongsTo(User, {
  foreignKey: 'assigned_to',
  as: 'AssignedMunicipal',
});

User.hasMany(Report, {
  foreignKey: 'user_id',
  as: 'Reports',
});

// Asociaciones ReportComment ↔ User
ReportComment.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'Author',
});

// Asociaciones ReportFollower ↔ User
ReportFollower.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'Follower',
});

// Asociaciones ReportNotification ↔ User
ReportNotification.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'Recipient',
});

User.hasMany(ReportNotification, {
  foreignKey: 'user_id',
  as: 'Notifications',
});

// Asociaciones ReportStatusHistory ↔ User
ReportStatusHistory.belongsTo(User, {
  foreignKey: 'changed_by',
  as: 'ChangedByUser',
});
