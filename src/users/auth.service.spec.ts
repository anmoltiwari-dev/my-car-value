import { BadRequestException } from "@nestjs/common";
import { NotFoundException } from "@nestjs/common/exceptions";
import { Test } from "@nestjs/testing";
import { AuthService } from "./auth.service";
import { User } from "./user.entity";
import { UsersService } from "./users.service";

describe('AuthService', () => {
    let service: AuthService;
    let fakeUsersService: Partial<UsersService>;

    beforeEach(async () => {
        const users: User[] = [];
        // Create a fake copy of users service
        fakeUsersService = {
            find: (email: string) => {
                const filteredUsers = users.filter(user => user.email === email);
                return Promise.resolve(filteredUsers);
            },
            create: (email: string, password: string) => {
                const user = {id: Math.floor(Math.random() * 99999), email, password} as User;
                users.push(user);
                return Promise.resolve(user);
            },
        }

        const module = await Test.createTestingModule({
            providers: [AuthService, {
                provide: UsersService,
                useValue: fakeUsersService,
            }]
        }).compile();

        service = module.get(AuthService);
    })

    it('can create an instance of auth service', async () => {
        expect(service).toBeDefined();
    });

    it('creates a new user with a salted and hashed password', async () => {
        const user = await service.signup('asdf@asdf.com', 'asdf');
        expect(user.password).not.toEqual('asdf');
        const [salt, hash] = user.password.split('.');
        expect(salt).toBeDefined();
        expect(hash).toBeDefined();
    });

    it('throws an error if user signs up with email that is in use', async () => {
        await service.signup('asdf@asdf.com', 'asdf');
        await expect(service.signup('asdf@asdf.com', 'asdf')).rejects.toThrow(
          BadRequestException,
        );
      });
     
      it('throws if signin is called with an unused email', async () => {
        await expect(
          service.signin('asdflkj@asdlfkj.com', 'passdflkj'),
        ).rejects.toThrow(NotFoundException);
      });
     
      it('throws if an invalid password is provided', async () => {
        await service.signup('laskdjf@alskdfj.com', 'password');
        await expect(
          service.signin('laskdjf@alskdfj.com', 'laksdlfkj'),
        ).rejects.toThrow(BadRequestException);
      });

    // it('throws an error if user signs up with an email already in use', async () => {
    //     fakeUsersService.find = () => Promise.resolve([{id: 1, email: 'a', password: '1'} as User]);
    //     await expect(service.signup('asdf@asdf.com', 'asdf')).rejects.toThrow(
    //         BadRequestException,
    //     );
    // });

    // it('throws err if signin is called with an unused email', async () => {
    //     await expect(service.signin('asdf@asdf.com', 'asdf')).rejects.toThrow(NotFoundException);
    // });

    // it('throws err if an invalid password is provided', async () => {
    //     fakeUsersService.find = () => Promise.resolve([{email: 'laskdjf@aslkdfj.com', password: 'laskdjf'} as User]);
    //     await expect(service.signin('laskdjf@aslkdfj.com', 'password')).rejects.toThrow(BadRequestException);
    // });

    it('returns a user if correct password is provided', async () => {
        await service.signup('laskdjf@aslkdfj.com', 'laskdjf');
        const user = await service.signin('laskdjf@aslkdfj.com', 'laskdjf');
        expect(user).toBeDefined();
    })
});