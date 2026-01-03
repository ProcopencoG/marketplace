import { createConsumer } from '@rails/actioncable';

// The URL for Action Cable is usually /cable or ws://localhost:3000/cable
// In development, Rails handles this.
const consumer = createConsumer();

export default consumer;
