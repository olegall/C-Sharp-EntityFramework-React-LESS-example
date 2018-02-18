using System;
using System.Collections.Generic;
using System.Linq;
using DirectPay.Logic.Dto;
using DirectPay.DAL.Entities.BankAccounts;


namespace DirectPay.Logic.Services
{
    public interface IAddressService
    {
        IQueryable<BankAccount> GetAddresses();
        void DeleteAddress(Guid id);

        string AddAddress(AddressDto input, IList<TranslationDto> names, bool global = false);
    }
}
