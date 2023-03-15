import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { User } from './user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let fakeUsersService: Partial<UsersService>;
  let fakeAuthService: Partial<AuthService>;

  beforeEach(async () => {
    fakeAuthService = {
      signin: (email: string, password: string) => Promise.resolve({ id: 1, email, password } as User),
      // signup: () => {},
    };

    fakeUsersService = {
      findOne: (id: number) => Promise.resolve({ id, email: 'asdf@asdf.com', password: 'asdf' } as User),
      find: (email: string) => Promise.resolve([{ id: 1, email, password: 'asdf' } as User]),
      // remove: () => {},
      // update: () => {},
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
        {
          provide: AuthService,
          useValue: fakeAuthService,
        }
      ]

    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAllUsers returns a list of users with the given email', async () => {
    const users = await controller.findAllUsers('asdf@asfd.com');
    expect(users.length).toEqual(1);
    expect(users[0].email).toEqual('asdf@asdf.com');
  });

  it('findUser returns a single user with the given id', async () => {
    const user = await controller.findUser('1');
    expect(user).toBeDefined();
  });

  it('findUser throws an err if user with given id is not found', async () => {
    await expect(controller.findUser('1')).rejects.toThrow(NotFoundException);
  });

  it('signin updates session object and returns user', async () => {
    const session = {};
    const user = await controller.signin(
      { email: 'asdf@asdf.com', password: 'asdf' },
      session
    );
    expect(user).toBeDefined();
    expect(user.id).toEqual(1);
  });
});
