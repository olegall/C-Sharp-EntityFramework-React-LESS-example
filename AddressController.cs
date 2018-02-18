using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using DirectPay.Common.Extensions;
using DirectPay.Common.Mappers;
using DirectPay.DAL.Entities.Operations;
using DirectPay.DAL.Entities.BankAccounts;
using DirectPay.Ioc;
using DirectPay.Logic.Dto;
using DirectPay.Logic.Services;
using DirectPay.Web.ViewModels;
using Microsoft.Extensions.Localization;

namespace DirectPay.Web.Areas.Company.Controllers
{
    [Authorize(Policy = "Company")]
    [Area("Company")]
    public class AddressController : Controller 
    {
        private readonly IOperationService _operationService;
        private readonly IAddressService _addressService;
        private readonly IStringLocalizer<SharedResource> _localizer;
        private readonly IDictionaryService _dictionaryService;
        private readonly IMapper<Operation, OperationVm> _operationMapper;
        private readonly IMapper<BankAccount, BankAccountVm> _addressMapper;
        public static readonly string Name = nameof(AddressController).TrimEnd("Controller");

        public AddressController(IAddressService addressService, IDictionaryService dictionaryService,
                                 IStringLocalizer<SharedResource> localizer)
        {
            _addressService = addressService;
            _dictionaryService = dictionaryService;
            _localizer = localizer;
        }

        public IActionResult Index()
        {
            IUrlHelper urlHelper = IocContainer.Container.GetInstance<IUrlHelper>();
            var model = new
            {
                getAddressesUrl = urlHelper.Action(nameof(GetAddresses_), Name),
                deleteAddressUrl = urlHelper.Action(nameof(DeleteAddress), Name),
                getAddressUrl = urlHelper.Action(nameof(GetAddress), Name),
                addAddressUrl = urlHelper.Action(nameof(AddAddress), Name),
            };
            return View("~/Areas/Company/Views/Settings/Addresses.cshtml", model);
        }

        [HttpPost]
        public string AddAddress(AddressDto address, IEnumerable<TranslationDto> names)
        {
            string result = _addressService.AddAddress(address, names.ToList(), true);
            return result == null ? null : string.Format(_localizer[result].Value, _localizer["Attribute"].Value);
        }

        public IEnumerable<DictionaryDto<string>> GetAddresses_()
        {
            var addresses =
            _addressService.GetAddresses()
                .Select(a => new DictionaryDto<string>
                {
                    Id = a.Id.ToString(),
                    Code = a.Code,
                    Name = a.Translations.Where(t => t.LanguageId == "RU").FirstOrDefault().Name
                });
            return addresses;
        }

        public object GetAddress(Guid id)
        {
            var address = _addressService.GetAddresses()
                .Select(a => new
                {
                    a.Id,
                    a.Code,
                    a.Props1,
                    a.Inn,
                    a.Okato,
                    a.PersonalAccount,
                    a.Kpp,
                    a.Props6,
                    a.Bic,
                    a.Account,
                    a.CorrespondentAccount,
                    a.Rounding,
                    a.Translations
                }).Where(a => a.Id == id).ToArray()[0];
            return address;
        }

        [HttpPost]
        public void DeleteAddress(Guid id)
        {
            _addressService.DeleteAddress(id);
        }
    }
}