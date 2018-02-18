using System;
using System.Collections.Generic;
using System.Linq;
using DirectPay.DAL;
using DirectPay.DAL.Attributes;
using DirectPay.DAL.Entities.BankAccounts;
using DirectPay.DAL.Repositories;
using DirectPay.Logic.Dto;
using DirectPay.Logic.Services;

namespace DirectPay.Logic.ServicesImpl
{
    public class AddressService : IAddressService
    {
        private readonly IUnitOfWork _globalUnitOfWork;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IConstantService _constantService;
        private readonly ICompanyManagerService _companyManagerService;
        private readonly IHistConstantsService _histConstantsService;

        private readonly IGenericRepository<BankAccount> _addressRep;

        public AddressService([GlobalContext]IUnitOfWork globalUnitOfWork, IConstantService constantService,
            ICompanyManagerService companyManagerService, IHistConstantsService histConstantsService, IUnitOfWork unitOfWork)
        {
            _globalUnitOfWork = globalUnitOfWork;
            _constantService = constantService;
            _companyManagerService = companyManagerService;
            _histConstantsService = histConstantsService;
            _addressRep = unitOfWork.GetRepository<BankAccount>();
            _unitOfWork = unitOfWork;
        }

        public IQueryable<BankAccount> GetAddresses()
        {
            IQueryable<BankAccount> addresses = _addressRep.Query();
            return addresses;
        }

        public void DeleteAddress(Guid id)
        {
            _addressRep.DeleteById(id);
            _unitOfWork.Save();
        }

        public string AddAddress(AddressDto input, IList<TranslationDto> names, bool global = false)
        {
            var addressRep = _unitOfWork.GetRepository<BankAccount>() as IEntityWithUniqueCodeRepository<BankAccount>;
            BankAccount address;

            if (input.Id == Guid.Empty)
            {
                if (addressRep?.FindByCode(input.Code) != null)
                {
                    return "CodeDuplicate";
                }
                address = new BankAccount
                {
                    Id = Guid.NewGuid(),
                    Code = input.Code,
                    Props1 = input.Props1,
                    Inn = input.Inn,
                    Okato = input.Okato,
                    PersonalAccount = input.PersonalAccount,
                    Kpp = input.Kpp,
                    Props6 = input.Props6,
                    Bic = input.Bic,
                    Account = input.Account,
                    CorrespondentAccount = input.CorrespondentAccount,
                    Rounding = input.Rounding,
                };
                addressRep.Insert(address);
            }
            else
            {
                address = GetAddressById(input.Id);
            }

            foreach (var name in names)
            {
                address.Translations.Add(new BankAccountTranslation()
                {
                    BankAccountId = address.Id,
                    LanguageId = name.LanguageCode,
                    Name = name.Text,
                });
            }

            address.Code = input.Code;
            address.Props1 = input.Props1;
            address.Inn = input.Inn;
            address.Okato = input.Okato;
            address.PersonalAccount = input.PersonalAccount;
            address.Kpp = input.Kpp;
            address.Props6 = input.Props6;
            address.Bic = input.Bic;
            address.Account = input.Account;
            address.CorrespondentAccount = input.CorrespondentAccount;
            address.Rounding = input.Rounding;
            _unitOfWork.Save();

            return null;
        }

        public BankAccount GetAddressById(Guid? id)
        {
            if (!id.HasValue)
            {
                return null;
            }

            var rep = _addressRep;
            return rep.Query().SingleOrDefault(x => x.Id == id);
        }
    }
}
