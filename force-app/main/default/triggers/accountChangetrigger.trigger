trigger accountChangetrigger on AccountChangeEvent (after insert) {
    for (AccountChangeEvent ace : Trigger.new) {
        System.debug('Account Change Event: ' + ace);
        
        Messaging.SingleEmailMessage emailMessage = new Messaging.SingleEmailMessage();
        emailMessage.setSubject('Account Change Detected');
        emailMessage.setPlainTextBody('An account change event has been detected for account: ' + ace.ID);
        emailMessage.setToAddresses(new List<String>{'neerajthefuture7@gmail.com'});
        emailMessage.setSaveAsActivity(false); // Required for platform events
        
        // Send email and capture result
        List<Messaging.SendEmailResult> results = Messaging.sendEmail(new List<Messaging.SingleEmailMessage>{emailMessage});
        
        // Log the result for debugging
        for (Messaging.SendEmailResult result : results) {
            if (result.isSuccess()) {
                System.debug('Email sent successfully');
            } else {
                System.debug('Email failed to send');
                for (Messaging.SendEmailError error : result.getErrors()) {
                    System.debug('Error: ' + error.getMessage());
                    System.debug('Status Code: ' + error.getStatusCode());
                }
            }
        }
    }
}