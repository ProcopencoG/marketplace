using FluentValidation;
using PiataOnline.Core.DTOs;

namespace PiataOnline.Core.Validators;

/// <summary>
/// Validates CreateStallRequest according to business rules
/// </summary>
public class CreateStallValidator : AbstractValidator<CreateStallRequest>
{
    public CreateStallValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Numele tarabei este obligatoriu")
            .Length(3, 50).WithMessage("Numele trebuie să aibă între 3 și 50 de caractere");

        RuleFor(x => x.Description)
            .NotEmpty().WithMessage("Descrierea este obligatorie")
            .Length(10, 1000).WithMessage("Descrierea trebuie să aibă între 10 și 1000 de caractere");

        RuleFor(x => x.Location)
            .NotEmpty().WithMessage("Locația este obligatorie")
            .MaximumLength(100).WithMessage("Locația nu poate depăși 100 de caractere");

        RuleFor(x => x.UserId)
            .GreaterThan(0).WithMessage("UserId invalid");
    }
}

public class UpdateStallValidator : AbstractValidator<UpdateStallRequest>
{
    public UpdateStallValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Numele tarabei este obligatoriu")
            .Length(3, 50).WithMessage("Numele trebuie să aibă între 3 și 50 de caractere");

        RuleFor(x => x.Description)
            .NotEmpty().WithMessage("Descrierea este obligatorie")
            .Length(10, 1000).WithMessage("Descrierea trebuie să aibă între 10 și 1000 de caractere");

        RuleFor(x => x.Location)
            .NotEmpty().WithMessage("Locația este obligatorie")
            .MaximumLength(100).WithMessage("Locația nu poate depăși 100 de caractere");
    }
}

/// <summary>
/// Validates CreateProductRequest with price range 0.50 - 50,000 RON
/// </summary>
public class CreateProductValidator : AbstractValidator<CreateProductRequest>
{
    public CreateProductValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Numele produsului este obligatoriu")
            .Length(2, 100).WithMessage("Numele trebuie să aibă între 2 și 100 de caractere");

        RuleFor(x => x.Description)
            .MaximumLength(500).WithMessage("Descrierea nu poate depăși 500 de caractere");

        RuleFor(x => x.PriceCents)
            .InclusiveBetween(50, 5000000).WithMessage("Prețul trebuie să fie între 0.50 și 50,000 RON");

        RuleFor(x => x.StallId)
            .GreaterThan(0).WithMessage("StallId invalid");

        RuleFor(x => x.MeasureUnit)
            .NotEmpty().WithMessage("Unitatea de măsură este obligatorie");

        RuleFor(x => x.Category)
            .NotEmpty().WithMessage("Categoria este obligatorie");
    }
}

public class UpdateProductValidator : AbstractValidator<UpdateProductRequest>
{
    public UpdateProductValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Numele produsului este obligatoriu")
            .Length(2, 100).WithMessage("Numele trebuie să aibă între 2 și 100 de caractere");

        RuleFor(x => x.Description)
            .MaximumLength(500).WithMessage("Descrierea nu poate depăși 500 de caractere");

        RuleFor(x => x.PriceCents)
            .InclusiveBetween(50, 5000000).WithMessage("Prețul trebuie să fie între 0.50 și 50,000 RON");

        RuleFor(x => x.MeasureUnit)
            .NotEmpty().WithMessage("Unitatea de măsură este obligatorie");

        RuleFor(x => x.Category)
            .NotEmpty().WithMessage("Categoria este obligatorie");
    }
}

public class CreateUserValidator : AbstractValidator<CreateUserRequest>
{
    public CreateUserValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Numele este obligatoriu")
            .Length(2, 100).WithMessage("Numele trebuie să aibă între 2 și 100 de caractere");

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email-ul este obligatoriu")
            .EmailAddress().WithMessage("Email-ul nu este valid");

        RuleFor(x => x.Provider)
            .NotEmpty().WithMessage("Provider-ul este obligatoriu")
            .Must(p => p == "google" || p == "facebook").WithMessage("Provider-ul trebuie să fie 'google' sau 'facebook'");

        RuleFor(x => x.Uid)
            .NotEmpty().WithMessage("UID-ul este obligatoriu");
    }
}

/// <summary>
/// Validates CreateOrderRequest with minimum order value 5 RON, max 50 items
/// </summary>
public class CreateOrderValidator : AbstractValidator<CreateOrderRequest>
{
    public CreateOrderValidator()
    {
        RuleFor(x => x.StallId)
            .GreaterThan(0).WithMessage("StallId invalid");

        RuleFor(x => x.Items)
            .NotEmpty().WithMessage("Comanda trebuie să conțină cel puțin un produs")
            .Must(items => items.Count <= 50).WithMessage("Comanda nu poate conține mai mult de 50 de produse");

        RuleForEach(x => x.Items).SetValidator(new OrderItemRequestValidator());
    }
}

public class OrderItemRequestValidator : AbstractValidator<OrderItemRequest>
{
    public OrderItemRequestValidator()
    {
        RuleFor(x => x.ProductId)
            .GreaterThan(0).WithMessage("ProductId invalid");

        RuleFor(x => x.Quantity)
            .GreaterThan(0).WithMessage("Cantitatea trebuie să fie mai mare decât 0")
            .LessThanOrEqualTo(100).WithMessage("Cantitatea nu poate depăși 100");
    }
}

/// <summary>
/// Validates CreateReviewRequest with rating 1-5, comment 10-500 chars
/// </summary>
public class CreateReviewValidator : AbstractValidator<CreateReviewRequest>
{
    public CreateReviewValidator()
    {
        RuleFor(x => x.Rating)
            .InclusiveBetween(1, 5).WithMessage("Rating-ul trebuie să fie între 1 și 5");

        RuleFor(x => x.Comment)
            .Length(10, 500).WithMessage("Comentariul trebuie să aibă între 10 și 500 de caractere")
            .When(x => !string.IsNullOrEmpty(x.Comment));

        RuleFor(x => x.ProductId)
            .GreaterThan(0).WithMessage("ProductId invalid");

        RuleFor(x => x.UserId)
            .GreaterThan(0).WithMessage("UserId invalid");
    }
}

public class CreateMessageValidator : AbstractValidator<CreateMessageRequest>
{
    public CreateMessageValidator()
    {
        RuleFor(x => x.Content)
            .NotEmpty().WithMessage("Mesajul nu poate fi gol")
            .MaximumLength(1000).WithMessage("Mesajul nu poate depăși 1000 de caractere");
    }
}

public class AddToCartValidator : AbstractValidator<AddToCartRequest>
{
    public AddToCartValidator()
    {
        RuleFor(x => x.ProductId)
            .GreaterThan(0).WithMessage("ProductId invalid");

        RuleFor(x => x.Quantity)
            .GreaterThan(0).WithMessage("Cantitatea trebuie să fie mai mare decât 0")
            .LessThanOrEqualTo(100).WithMessage("Cantitatea nu poate depăși 100");
    }
}
