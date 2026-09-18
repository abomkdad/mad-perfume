import unittest
from clock_history import recording_offset

class ClockHistoryTests(unittest.TestCase):
    def setUp(self):
        self.rows=[dict(device='one',startedAt=1000,finishedAt=1003,previousOffsetSeconds=-510,status='verified'),dict(device='one',startedAt=2000,finishedAt=2003,previousOffsetSeconds=-3,status='verified')]
    def test_historical_and_current(self):
        for start,end,expected in [(100,200,-510),(1100,1200,-3),(2100,2200,1)]:
            self.assertEqual(recording_offset('one',start,end,1,self.rows),expected)
    def test_other_device(self):
        self.assertEqual(recording_offset('two',100,200,5,self.rows),5)
    def test_boundary(self):
        for start,end in [(900,1001),(1001,1100),(998,1002)]:
            with self.assertRaises(ValueError):recording_offset('one',start,end,1,self.rows)
    def test_pending(self):
        self.rows[0]['status']='pending'
        self.assertEqual(recording_offset('one',100,200,1,self.rows),-510)
        with self.assertRaises(ValueError):recording_offset('one',1100,1200,1,self.rows)
if __name__=='__main__':unittest.main()
