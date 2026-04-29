trigger accountChangetrigger on AccountChangeEvent (after insert) {
    List<Messaging.SingleEmailMessage> emails = new List<Messaging.SingleEmailMessage>();

    // Get the email from Custom Label
    String targetEmail = System.Label.NotificationEmail;

    // Get Org Wide Email Default
    OrgWideEmailAddress[] owea = [SELECT Id, Address FROM OrgWideEmailAddress LIMIT 1];
    List<String> toAddresses = new List<String>{targetEmail};
    if (owea.size() > 0) {
        toAddresses.add(owea[0].Address);
    }

    for (AccountChangeEvent ace : Trigger.new) {
        EventBus.ChangeEventHeader header = ace.ChangeEventHeader;
        
        // We only want to send email when fields are updated
        if (header.changeType == 'UPDATE') {

            // Construct the email body
            String emailBody = 'Hello,\n\n';
            emailBody += 'This email is being received as a test.\n\n';
            emailBody += 'An Account has been updated. Details:\n';
            emailBody += 'Record ID(s): ' + String.join(header.recordIds, ', ') + '\n';
            emailBody += 'Modified by User ID: ' + header.commitUser + '\n';
            emailBody += 'Transaction Key: ' + header.transactionKey + '\n\n';

            emailBody += 'Changed Fields and their new values:\n';

            // Getting changed fields dynamically
            List<String> changedFields = header.changedFields;
            if (changedFields != null && !changedFields.isEmpty()) {
                for (String field : changedFields) {
                    try {
                        Object newValue = ace.get(field);
                        emailBody += '- ' + field + ': ' + newValue + '\n';
                    } catch (Exception e) {
                        emailBody += '- ' + field + ': (Could not retrieve value)\n';
                    }
                }
            } else {
                emailBody += 'No fields captured in ChangeEventHeader.changedFields.\n';
            }

            emailBody += '\nRegards,\nSalesforce System';

            Messaging.SingleEmailMessage emailMessage = new Messaging.SingleEmailMessage();
            emailMessage.setSubject('Account Update Notification: ' + header.transactionKey);
            emailMessage.setPlainTextBody(emailBody);
            emailMessage.setToAddresses(toAddresses);
            emailMessage.setSaveAsActivity(false);

            emails.add(emailMessage);
        }
    }

    if (!emails.isEmpty()) {
        List<Messaging.SendEmailResult> results = Messaging.sendEmail(emails, false);
        for (Messaging.SendEmailResult result : results) {
            if (!result.isSuccess()) {
                System.debug('Email failed to send. Errors: ' + result.getErrors());
            }
        }
    }
}
