using Hangfire;
using Hangfire.Dashboard.BasicAuthorization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Project.Data;
using Project.Data.Models;
using Project.Dtos.System;
using Project.Hubs;
using Project.Middleware;
using Project.Seed;
using Project.Services.Implementation;
using Project.Services.Interface;
using Serilog;
using System.Security.Claims;
using System.Text;
using System.Linq;
using System.Text.Json.Serialization;
using QuestPDF.Infrastructure;

namespace Project
{
    public class Program
    {
        public static void Main(string[] args)
        {
            QuestPDF.Settings.License = LicenseType.Community;
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.

            builder.Services.AddHangfire(conf =>
            {
                conf.UseSqlServerStorage(builder.Configuration.GetConnectionString("DefaultConnection"));
            });

            builder.Services.AddHangfireServer();

            builder.Services.AddDbContext<AppDbContext>(options =>
            options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

            builder.Services.AddIdentity<User, IdentityRole>()
                .AddEntityFrameworkStores<AppDbContext>()
                .AddDefaultTokenProviders();

            builder.Services.AddScoped<IUserEmailStore<User>>(sp =>
          (IUserEmailStore<User>)sp.GetRequiredService<IUserStore<User>>());

            builder.Host.UseSerilog((context, configuration) =>
            {
                configuration.ReadFrom.Configuration(context.Configuration);

            });

            builder.Services.AddSwaggerGen(c =>
            {
                c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
                {
                    Name = "Authorization",
                    Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
                    Scheme = "Bearer",
                    BearerFormat = "JWT",
                    In = Microsoft.OpenApi.Models.ParameterLocation.Header,
                    Description = "Enter  your token in the text input below.\n\nExample: '12345abcdef'",
                });

                c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
             {
                 {
                     new Microsoft.OpenApi.Models.OpenApiSecurityScheme
                     {
                         Reference = new Microsoft.OpenApi.Models.OpenApiReference
                         {
                             Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                             Id = "Bearer"
                         }
                     },
                     new string[] { }
                 }
             });
            });

            builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection(JwtSettings.SectionName));

            var jwtSettings = new JwtSettings();
            builder.Configuration.GetSection(JwtSettings.SectionName).Bind(jwtSettings);

            builder.Services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = jwtSettings.Issuer,
                    ValidAudience = jwtSettings.Audience,
                    ClockSkew = TimeSpan.Zero,
                    RoleClaimType = ClaimTypes.Role,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.SecretKey))
                };
                
                options.Events = new JwtBearerEvents
                {
                    OnMessageReceived = context =>
                    {
                        var accessToken = context.Request.Query["access_token"];
                        var path = context.HttpContext.Request.Path;
                        
                        if (!string.IsNullOrEmpty(accessToken) && 
                            (path.StartsWithSegments("/chathub") || 
                             path.StartsWithSegments("/orderhub") ||
                             path.Value?.Contains("/negotiate") == true))
                        {
                            context.Token = accessToken;
                        }
                        else if (string.IsNullOrEmpty(context.Token))
                        {
                            var authHeader = context.Request.Headers["Authorization"].FirstOrDefault();
                            if (!string.IsNullOrEmpty(authHeader) && authHeader.StartsWith("Bearer "))
                            {
                                context.Token = authHeader.Substring("Bearer ".Length).Trim();
                            }
                        }
                        
                        return Task.CompletedTask;
                    }
                };
            });

            builder.Services.AddScoped<IUser, UserService>();
            builder.Services.AddScoped<ITokenService, TokenService>();
            builder.Services.AddScoped<CurrentUserService>();
            builder.Services.AddScoped<ICategory, CategoryService>();
            builder.Services.AddScoped<IMenuItem, MenuItemService>();
            builder.Services.AddScoped<IOrder, OrderService>();
            builder.Services.AddScoped<ITable, TableService>();
            builder.Services.AddScoped<ITableSessionService, TableSessionService>();
            builder.Services.AddScoped<IQRCodeService, QRCodeService>();
            builder.Services.AddScoped<IReservation, ReservationService>();
            builder.Services.AddScoped<IPayment, PaymentService>();
            builder.Services.AddScoped<IShift, ShiftService>();
            builder.Services.AddScoped<IStatistics, StatisticsService>();
            builder.Services.AddScoped<IPdfService, PdfService>();

            builder.Services.AddSignalR();

            builder.Services.AddHttpContextAccessor();

            builder.Services.AddMemoryCache();

            builder.Services.AddAuthorization();


            builder.Services.AddControllers()
                .AddJsonOptions(o =>
                {
                    o.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
                });
            // Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
            builder.Services.AddOpenApi();

            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowReactApp", policy =>
                {
                    policy.WithOrigins("http://localhost:3000")
                          .AllowAnyHeader()
                          .AllowAnyMethod()
                          .AllowCredentials();
                });
            });

            var app = builder.Build();

            SeedData.InitializeAsync(app.Services).GetAwaiter().GetResult();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.MapOpenApi();
                app.UseSwagger();
                app.UseSwaggerUI(app =>
                {
                    app.SwaggerEndpoint("/swagger/v1/swagger.json", "Identity API V1");
                });
            }

            app.UseCors("AllowReactApp");

            if (!app.Environment.IsDevelopment())
            {
                app.UseHttpsRedirection();
            }

            app.UseMiddleware<ExceptionHandlingMiddleware>();
            app.UseAuthentication();
            app.UseAuthorization();


            app.MapControllers();

            app.UseHangfireDashboard("/hangfire", new DashboardOptions
            {
                Authorization = new[]
                {
                    new BasicAuthAuthorizationFilter(
                        new BasicAuthAuthorizationFilterOptions
                        {
                            SslRedirect = false,
                            RequireSsl = false,
                            LoginCaseSensitive = true,
                            Users = new[]
                            {
                                new BasicAuthAuthorizationUser
                                {
                                    Login = "admin",
                                    PasswordClear = "password"
                                }
                            }
                        })
                }
            });

            app.MapHub<ChatHub>("/chathub", options =>
            {

            });

            app.MapHub<OrderHub>("/orderhub", options =>
            {

            });

            app.Run();
        }
    }
}
