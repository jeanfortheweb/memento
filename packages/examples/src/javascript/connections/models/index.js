import { connect } from '@memento/memento';
import contacts from './contacts';
import form from './form';
import faker from 'faker/locale/en';

// create model instances.
const ContactsModel = contacts();
const FormModel = form();

// create some default contacts.
for (let i = 0; i < 15; i++) {
  ContactsModel.input.create.next({
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    phone: faker.phone.phoneNumber(),
  });
}

// create a bidirectional connection between contacts and form.
// that will connect:
//
// Contacts::selected -> Form::selected
// Contacts::contacts -> Form::contacts
// Contacts::create   <- Form::create
// Contacts::update   <- Form::update
// Contacts::select   <- Form::select
connect(ContactsModel, FormModel, true);

export { ContactsModel, FormModel };
