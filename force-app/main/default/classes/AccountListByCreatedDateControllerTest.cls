@isTest
private class AccountListByCreatedDateControllerTest {
    
    @TestSetup
    static void setupTestData() {
        List<Account> testAccounts = new List<Account>();
        
        for (Integer i = 1; i <= 10; i++) {
            testAccounts.add(new Account(
                Name = 'Test Account ' + i,
                BillingStreet = i + ' Test Street',
                BillingCity = 'Test City',
                BillingState = 'TS',
                BillingPostalCode = '1000' + i,
                BillingCountry = 'Test Country',
                AnnualRevenue = 100000 * i
            ));
        }
        
        insert testAccounts;
    }
    
    @isTest
    static void testGetAccountsByCreatedDate_WithLimit5() {
        Test.startTest();
        List<Account> result = AccountListByCreatedDateController.getAccountsByCreatedDate(5);
        Test.stopTest();
        
        System.assertEquals(5, result.size(), 'Should return exactly 5 accounts');
        
        // Verify sorting by CreatedDate DESC
        for (Integer i = 0; i < result.size() - 1; i++) {
            System.assert(
                result[i].CreatedDate >= result[i + 1].CreatedDate,
                'Accounts should be sorted by CreatedDate DESC'
            );
        }
    }
    
    @isTest
    static void testGetAccountsByCreatedDate_WithLimit10() {
        Test.startTest();
        List<Account> result = AccountListByCreatedDateController.getAccountsByCreatedDate(10);
        Test.stopTest();
        
        System.assertEquals(10, result.size(), 'Should return exactly 10 accounts');
    }
    
    @isTest
    static void testGetAccountsByCreatedDate_WithLimit15() {
        Test.startTest();
        List<Account> result = AccountListByCreatedDateController.getAccountsByCreatedDate(15);
        Test.stopTest();
        
        System.assertEquals(10, result.size(), 'Should return 10 accounts when only 10 exist');
    }
    
    @isTest
    static void testGetAccountsByCreatedDate_NullLimit() {
        Test.startTest();
        List<Account> result = AccountListByCreatedDateController.getAccountsByCreatedDate(null);
        Test.stopTest();
        
        System.assertEquals(5, result.size(), 'Should default to 5 accounts when limit is null');
    }
    
    @isTest
    static void testGetAccountsByCreatedDate_ZeroLimit() {
        Test.startTest();
        List<Account> result = AccountListByCreatedDateController.getAccountsByCreatedDate(0);
        Test.stopTest();
        
        System.assertEquals(5, result.size(), 'Should default to 5 accounts when limit is 0');
    }
    
    @isTest
    static void testGetAccountsByCreatedDate_VerifyFields() {
        Test.startTest();
        List<Account> result = AccountListByCreatedDateController.getAccountsByCreatedDate(5);
        Test.stopTest();
        
        Account firstAccount = result[0];
        System.assertNotEquals(null, firstAccount.Name, 'Name should not be null');
        System.assertNotEquals(null, firstAccount.BillingCity, 'BillingCity should not be null');
        System.assertNotEquals(null, firstAccount.BillingState, 'BillingState should not be null');
        System.assertNotEquals(null, firstAccount.AnnualRevenue, 'AnnualRevenue should not be null');
        System.assertNotEquals(null, firstAccount.CreatedDate, 'CreatedDate should not be null');
    }
    
    @isTest
    static void testGetAccountsByCreatedDate_NewestFirst() {
        // Create a new account to ensure it appears first
        Account newestAccount = new Account(
            Name = 'Newest Account',
            BillingStreet = '999 Latest Street',
            BillingCity = 'New City',
            BillingState = 'NC',
            BillingPostalCode = '99999',
            BillingCountry = 'USA',
            AnnualRevenue = 999000
        );
        insert newestAccount;
        
        Test.startTest();
        List<Account> result = AccountListByCreatedDateController.getAccountsByCreatedDate(5);
        Test.stopTest();
        
        System.assertEquals('Newest Account', result[0].Name, 'Newest account should be first');
    }
}